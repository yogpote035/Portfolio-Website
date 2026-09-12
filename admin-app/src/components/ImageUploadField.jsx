import { useEffect, useState } from "react";
import { fetchApiAuth } from "../utils/authClient.js";
import ImageDropZone from "./ImageDropZone.jsx";

function ImageUploadField({
  label,
  folder,
  valueUrl,
  onUploaded,
  previewAlt = "Uploaded image preview",
}) {
  const [previewUrl, setPreviewUrl] = useState(valueUrl || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPreviewUrl(valueUrl || "");
  }, [valueUrl]);
  useEffect(
    () => () => {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const isImageFile = (file) =>
    file && typeof file.type === "string" && file.type.startsWith("image/");

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) {
      return;
    }

    if (!isImageFile(file)) {
      setError("Only image files are allowed.");
      setPreviewUrl(valueUrl || "");
      return;
    }

    setError("");
    setUploading(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("folder", folder);

      const media = await fetchApiAuth("/api/admin/media/images", {
        method: "POST",
        body: formData,
      });

      setPreviewUrl(media.url);
      onUploaded(media);
    } catch (err) {
      setError(err.message || "Image upload failed");
      setPreviewUrl(valueUrl || "");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-upload-field">
      <ImageDropZone
        label={label}
        onFiles={handleFiles}
        onRejected={(message) => setError(message)}
        disabled={uploading}
      />
      {previewUrl ? (
        <span className="admin-upload-preview">
          <img src={previewUrl} alt={previewAlt} loading="lazy" />
        </span>
      ) : null}
      {uploading ? (
        <span className="admin-help-text">Uploading image...</span>
      ) : null}
      {error ? <span className="admin-field-error">{error}</span> : null}
    </div>
  );
}

export default ImageUploadField;
