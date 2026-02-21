"use client";
import { useState } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/storage/upload-url", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) continue;
      const { publicUrl } = await res.json();
      uploaded.push(publicUrl);
    }
    onChange([...images, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(url: string) {
    onChange(images.filter((i) => i !== url));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200 group">
            <Image src={url} alt="Product" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer border border-dashed border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-500 hover:border-amber-400 hover:text-amber-700 transition">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? "Uploading…" : "+ Add images"}
      </label>
    </div>
  );
}
