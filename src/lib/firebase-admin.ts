// Cloudflare Workers-compatible Firestore client using REST API.
// Does NOT use firebase-admin (requires Node.js internals unavailable in Workers).
// Signs a service-account JWT locally via Web Crypto to obtain an OAuth2 access token,
// then calls the Firestore REST API directly.

const FIRESTORE_BASE = () =>
  `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents`;

function projectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    ""
  ).trim();
}

// ─── Service-account JWT → OAuth2 access token ────────────────────────────────

async function getAccessToken(): Promise<string> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyPem = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKeyPem) {
    throw new Error(
      `Firebase admin credentials not configured (email: ${clientEmail ? "set" : "missing"}, key: ${privateKeyPem ? "set" : "missing"})`
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.full_control",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: unknown) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const signInput = `${encode(header)}.${encode(claim)}`;

  const pemBody = privateKeyPem
    .replace(/\\n/g, "\n")
    .replace(/[^A-Za-z0-9+/=]/g, "")
    .replace(/^BEGIN(RSA|EC)?PRIVATEKEY/, "")
    .replace(/END(RSA|EC)?PRIVATEKEY$/, "");

  const pemBinary = atob(pemBody);
  const pemBytes = new Uint8Array(pemBinary.length);
  for (let i = 0; i < pemBinary.length; i++) {
    pemBytes[i] = pemBinary.charCodeAt(i);
  }

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      pemBytes.buffer as ArrayBuffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );
  } catch (err) {
    throw new Error(
      `Failed to import Firebase private key: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput).buffer as ArrayBuffer
  );

  const encodedSig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${signInput}.${encodedSig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(
      `Failed to get access token: ${tokenData.error_description || tokenData.error || JSON.stringify(tokenData)}`
    );
  }

  return tokenData.access_token;
}

// ─── Firestore value converters ────────────────────────────────────────────────

function docToObject(doc: Record<string, unknown>): Record<string, unknown> {
  const fields = doc.fields as Record<string, Record<string, unknown>> | undefined;
  if (!fields) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = firestoreValueToJs(value);
  }
  return result;
}

function firestoreValueToJs(value: Record<string, unknown>): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) {
    const arr = value.arrayValue as { values?: Record<string, unknown>[] };
    return (arr.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in value) {
    const map = value.mapValue as { fields?: Record<string, Record<string, unknown>> };
    const obj: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(map.fields || {})) {
      obj[k] = firestoreValueToJs(v);
    }
    return obj;
  }
  return null;
}

function jsToFirestoreValue(value: unknown): Record<string, unknown> {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number") {
    if (Number.isInteger(value)) return { integerValue: String(value) };
    return { doubleValue: value };
  }
  if (typeof value === "boolean") return { booleanValue: value };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(jsToFirestoreValue) } };
  }
  if (typeof value === "object") {
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = jsToFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const firestore = {
  async getDoc(
    collection: string,
    docId: string
  ): Promise<{ exists: boolean; id: string; data: Record<string, unknown> }> {
    const token = await getAccessToken();
    const res = await fetch(`${FIRESTORE_BASE()}/${collection}/${docId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return { exists: false, id: docId, data: {} };
    const doc = await res.json();
    return { exists: true, id: docId, data: docToObject(doc) };
  },

  async listDocs(
    collection: string
  ): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
    const token = await getAccessToken();
    const res = await fetch(`${FIRESTORE_BASE()}/${collection}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    const documents = result.documents as Record<string, unknown>[] | undefined;
    if (!documents) return [];
    return documents.map((doc) => {
      const name = doc.name as string;
      const id = name.split("/").pop()!;
      return { id, data: docToObject(doc) };
    });
  },

  async query(
    collection: string,
    filters: Array<{ field: string; op: string; value: unknown }>,
    orderByField?: string,
    orderDirection?: "ASCENDING" | "DESCENDING",
    limitCount?: number
  ): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
    const token = await getAccessToken();
    const pid = projectId();

    const structuredQuery: Record<string, unknown> = {
      from: [{ collectionId: collection }],
    };

    if (filters.length > 0) {
      structuredQuery.where =
        filters.length === 1
          ? {
              fieldFilter: {
                field: { fieldPath: filters[0].field },
                op: filters[0].op,
                value: jsToFirestoreValue(filters[0].value),
              },
            }
          : {
              compositeFilter: {
                op: "AND",
                filters: filters.map((f) => ({
                  fieldFilter: {
                    field: { fieldPath: f.field },
                    op: f.op,
                    value: jsToFirestoreValue(f.value),
                  },
                })),
              },
            };
    }

    if (orderByField) {
      structuredQuery.orderBy = [
        { field: { fieldPath: orderByField }, direction: orderDirection || "ASCENDING" },
      ];
    }

    if (limitCount) structuredQuery.limit = limitCount;

    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ structuredQuery }),
      }
    );

    const results = await res.json();
    if (!Array.isArray(results)) return [];
    return results
      .filter((r: Record<string, unknown>) => r.document)
      .map((r: Record<string, unknown>) => {
        const doc = r.document as Record<string, unknown>;
        const name = doc.name as string;
        return { id: name.split("/").pop()!, data: docToObject(doc) };
      });
  },

  async addDoc(collection: string, data: Record<string, unknown>): Promise<string> {
    const token = await getAccessToken();
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) fields[k] = jsToFirestoreValue(v);

    const res = await fetch(`${FIRESTORE_BASE()}/${collection}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });

    const doc = await res.json();
    if (!res.ok || !doc.name) {
      throw new Error(`Firestore addDoc failed: ${doc.error?.message || JSON.stringify(doc)}`);
    }
    return (doc.name as string).split("/").pop()!;
  },

  async setDoc(
    collection: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const token = await getAccessToken();
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) fields[k] = jsToFirestoreValue(v);

    await fetch(`${FIRESTORE_BASE()}/${collection}/${docId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
  },

  async updateDoc(
    collection: string,
    docId: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const token = await getAccessToken();
    const fields: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) fields[k] = jsToFirestoreValue(v);

    const updateMask = Object.keys(data)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join("&");

    await fetch(`${FIRESTORE_BASE()}/${collection}/${docId}?${updateMask}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    });
  },

  async deleteDoc(collection: string, docId: string): Promise<void> {
    const token = await getAccessToken();
    await fetch(`${FIRESTORE_BASE()}/${collection}/${docId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
