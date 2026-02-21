// Generates a signed Firebase Storage upload URL using a service-account JWT.
// The client uploads directly to Firebase Storage; we only generate the signed URL server-side.

async function getStorageAccessToken(): Promise<string> {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKeyPem = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKeyPem) {
    throw new Error("Firebase admin credentials not configured");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/devstorage.full_control",
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

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemBytes.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signInput).buffer as ArrayBuffer
  );

  const encodedSig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signInput}.${encodedSig}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get storage token: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

export async function getSignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not set");

  const token = await getStorageAccessToken();
  const encodedFilename = encodeURIComponent(`products/${filename}`);
  const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=products%2F${encodeURIComponent(filename)}`;

  // Return both the upload URL (needs auth header) and the public CDN URL
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedFilename}?alt=media`;

  return { uploadUrl, publicUrl };
}

export async function getUploadAuthHeader(): Promise<string> {
  const token = await getStorageAccessToken();
  return `Bearer ${token}`;
}
