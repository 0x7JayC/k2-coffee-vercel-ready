import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { supabase } from "@/lib/supabase";

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

  const getUploadUrlMutation = trpc.images.getUploadUrl.useMutation();

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

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      // Step 1: Get a signed upload URL from the server
      const { signedUrl, token, path, publicUrl } =
        await getUploadUrlMutation.mutateAsync({
          filename: file.name,
          type,
        });

      // Step 2: Upload the file directly to Supabase Storage (bypasses Vercel)
      const { error } = await supabase.storage
        .from("images")
        .uploadToSignedUrl(path, token, file, {
          contentType: file.type,
        });

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      onUpload(publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      const message =
        error instanceof Error ? error.message : "Failed to upload image";
      toast.error(message);
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
