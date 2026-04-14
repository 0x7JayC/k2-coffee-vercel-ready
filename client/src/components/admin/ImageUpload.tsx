import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  type: "product" | "ministry";
  currentImageUrl?: string;
}

export function ImageUpload({
  onUpload,
  type,
  currentImageUrl,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );

  const getProductImageUploadUrl = trpc.images.getProductImageUploadUrl.useQuery;
  const getMinistryImageUploadUrl = trpc.images.getMinistryImageUploadUrl.useQuery;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file using signed URL
    setIsUploading(true);
    try {
      // Get signed upload URL from server
      const uploadUrlQuery = type === "product" 
        ? getProductImageUploadUrl({ filename: file.name, mimeType: file.type })
        : getMinistryImageUploadUrl({ filename: file.name, mimeType: file.type });

      const { data: urlData, error: urlError } = await uploadUrlQuery;

      if (urlError || !urlData) {
        throw new Error(urlError?.message || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl, key } = urlData;

      // Upload file directly to Supabase Storage using the signed URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(`Upload failed: ${uploadResponse.status} ${errorText}`);
      }

      // Upload successful, notify parent with the public URL
      onUpload(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-amber-300 rounded-lg cursor-pointer hover:border-amber-400 transition">
            <div className="flex flex-col items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-amber-700 mb-2" />
                  <span className="text-sm text-amber-900">
                    Click to upload image
                  </span>
                  <span className="text-xs text-amber-700">
                    PNG, JPG up to 5MB
                  </span>
                </>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>

        {preview && (
          <div className="relative w-24 h-24">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg border border-amber-300"
            />
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
