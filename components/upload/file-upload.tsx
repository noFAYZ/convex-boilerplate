"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { handleMutationSuccess } from "@/lib/error-handler";
import { normalizeImageUrl } from "@/lib/normalize-image-url";

interface FileUploadProps {
  type: "avatar" | "logo" | "document";
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export const FileUpload = memo(function FileUpload({
  type,
  onUploadComplete,
  currentImage,
  label = "Upload Image",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(normalizeImageUrl(currentImage));
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when currentImage prop changes
  useEffect(() => {
    setPreview(normalizeImageUrl(currentImage));
  }, [currentImage]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Show loading toast
    const toastId = toast.loading("Uploading...", `0%`);

    // Upload to R2 with progress tracking
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        toast.progress(toastId, percent, `Uploading... ${percent}%`);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText);
          onUploadComplete(data.url);
          toast.dismiss(toastId);
          handleMutationSuccess("Upload successful");
          setIsUploading(false);
        } catch (err) {
          const errorMsg = "Failed to parse response";
          setError(errorMsg);
          toast.dismiss(toastId);
          toast.error("Upload failed", errorMsg);
          setPreview(normalizeImageUrl(currentImage));
          setIsUploading(false);
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          const errorMsg = data.error || "Upload failed";
          setError(errorMsg);
          toast.dismiss(toastId);
          toast.error("Upload failed", errorMsg);
          setPreview(normalizeImageUrl(currentImage));
          setIsUploading(false);
        } catch {
          const errorMsg = "Upload failed";
          setError(errorMsg);
          toast.dismiss(toastId);
          toast.error("Upload failed", errorMsg);
          setPreview(normalizeImageUrl(currentImage));
          setIsUploading(false);
        }
      }
    });

    xhr.addEventListener("error", () => {
      const errorMsg = "Network error";
      setError(errorMsg);
      toast.dismiss(toastId);
      toast.error("Upload failed", errorMsg);
      setPreview(normalizeImageUrl(currentImage));
      setIsUploading(false);
    });

    xhr.addEventListener("abort", () => {
      const errorMsg = "Upload cancelled";
      setError(errorMsg);
      toast.dismiss(toastId);
      toast.error("Upload cancelled", errorMsg);
      setPreview(normalizeImageUrl(currentImage));
      setIsUploading(false);
    });

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  }, [type, onUploadComplete, currentImage]);

  return (
    <div className="space-y-3">
      {preview && (
        <div className="relative w-24 h-24 rounded-full overflow-hidden border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : label}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
});

FileUpload.displayName = "FileUpload";
