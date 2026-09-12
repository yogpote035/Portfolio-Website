import { useId, useRef, useState } from "react";
import { Icon } from "./ui.jsx";

function extractImages(items) {
  return Array.from(items || [])
    .map((item) => (item.kind === "file" ? item.getAsFile() : item))
    .filter((file) => file?.type?.startsWith("image/"));
}

function extractImageUrl(dataTransfer) {
  const uri = dataTransfer
    .getData("text/uri-list")
    .split(/\r?\n/)
    .find((line) => line && !line.startsWith("#"));
  const plain = dataTransfer.getData("text/plain").trim();
  const htmlSource = dataTransfer
    .getData("text/html")
    .match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
  try {
    const url = new URL(uri || htmlSource || plain);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

async function imageFileFromUrl(url) {
  const response = await fetch(url, {
    credentials: "omit",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok)
    throw new Error(`Image request failed (${response.status}).`);
  const blob = await response.blob();
  if (!blob.type.startsWith("image/"))
    throw new Error("The URL is not an image.");
  const filename =
    decodeURIComponent(new URL(url).pathname.split("/").pop()) ||
    `pasted-image.${blob.type.split("/")[1] || "jpg"}`;
  return new File([blob], filename, { type: blob.type });
}

export default function ImageDropZone({
  label,
  multiple = false,
  disabled = false,
  onFiles,
  onRejected,
  helperText,
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);

  const submit = (files) => {
    const supplied = Array.from(files || []);
    const images = extractImages(files);
    if (images.length) {
      onFiles(multiple ? images : images.slice(0, 1));
    } else if (supplied.length) {
      onRejected?.("Only image files are supported.");
    }
  };

  const importUrl = async (url) => {
    setImporting(true);
    try {
      onFiles([await imageFileFromUrl(url)]);
    } catch {
      onRejected?.(
        "This image website blocks direct import. Save the image, then drop the downloaded file here, or use Copy image and paste it with Ctrl/⌘ + V.",
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="admin-upload-control">
      <span className="admin-upload-label">{label}</span>
      <div
        className={`admin-image-dropzone${dragging ? " is-dragging" : ""}${disabled || importing ? " is-disabled" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || importing}
        aria-describedby={`${inputId}-help`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled || importing) return;
          const images = extractImages(event.dataTransfer.files);
          if (images.length) {
            onFiles(multiple ? images : images.slice(0, 1));
            return;
          }
          const url = extractImageUrl(event.dataTransfer);
          if (url) importUrl(url);
          else onRejected?.("Only image files are supported.");
        }}
        onPaste={(event) => {
          if (disabled) return;
          const images = extractImages(event.clipboardData.items);
          if (images.length) {
            event.preventDefault();
            onFiles(multiple ? images : images.slice(0, 1));
          } else {
            const url = extractImageUrl(event.clipboardData);
            if (url) {
              event.preventDefault();
              importUrl(url);
            } else if (
              Array.from(event.clipboardData.items).some(
                (item) => item.kind === "file",
              )
            ) {
              onRejected?.("Only image files are supported.");
            }
          }
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="admin-upload-native-input"
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={disabled}
          onChange={(event) => {
            submit(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="admin-dropzone-icon">
          <Icon name="plus" size={20} />
        </span>
        <span>
          <strong>
            {importing
              ? "Importing image…"
              : dragging
                ? "Drop images here"
                : multiple
                  ? "Choose or drop images"
                  : "Choose or drop an image"}
          </strong>
          <small>Paste from clipboard with Ctrl/⌘ + V</small>
        </span>
      </div>
      <span id={`${inputId}-help`} className="admin-help-text">
        {helperText ||
          `${multiple ? "Multiple images" : "One image"} · PNG, JPG, WebP, GIF, or another browser-supported image format.`}
      </span>
    </div>
  );
}
