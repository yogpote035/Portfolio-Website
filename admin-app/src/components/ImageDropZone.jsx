import { useId, useRef, useState } from "react";
import { Icon } from "./ui.jsx";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPE_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

function normalizeImageFile(file) {
  if (!file) return null;
  if (ALLOWED_IMAGE_TYPES.has(file.type)) return file;
  const extension = file.name?.split(".").pop()?.toLowerCase();
  const inferredType = file.type ? "" : IMAGE_TYPE_BY_EXTENSION[extension];
  return inferredType
    ? new File([file], file.name, { type: inferredType, lastModified: file.lastModified })
    : null;
}

function extractImages(items) {
  return Array.from(items || [])
    .map((item) => (item.kind === "file" ? item.getAsFile() : item))
    .map(normalizeImageFile)
    .filter(Boolean);
}

function validateImages(files) {
  const supplied = Array.from(files || []);
  const valid = extractImages(supplied).filter((file) => file.size <= MAX_IMAGE_SIZE);
  if (valid.length === supplied.length) return { valid, error: "" };
  if (supplied.some((file) => file?.size > MAX_IMAGE_SIZE)) {
    return { valid, error: "Images must be 5 MB or smaller." };
  }
  return { valid, error: "Use a JPG, PNG, WebP, GIF, or SVG image." };
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
  if (!ALLOWED_IMAGE_TYPES.has(blob.type))
    throw new Error("The URL does not return a supported image.");
  if (blob.size > MAX_IMAGE_SIZE)
    throw new Error("The remote image is larger than 5 MB.");
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
    const { valid, error } = validateImages(supplied);
    if (valid.length) {
      onFiles(multiple ? valid : valid.slice(0, 1));
    }
    if (error && supplied.length) {
      onRejected?.(error);
    }
  };

  const importUrl = async (url) => {
    setImporting(true);
    try {
      onFiles([await imageFileFromUrl(url)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      onRejected?.(message.includes("5 MB") || message.includes("supported")
        ? message
        : "This website blocks direct image import (CORS). Save the image and drop the file here, or choose Copy image and paste it with Ctrl/⌘ + V.");
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
        tabIndex={disabled || importing ? -1 : 0}
        aria-disabled={disabled || importing}
        aria-describedby={`${inputId}-help`}
        onClick={() => !disabled && !importing && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && !importing && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && !importing) setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !importing) event.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (disabled || importing) return;
          const supplied = Array.from(event.dataTransfer.files || []);
          const validDroppedImages = validateImages(supplied).valid;
          if (validDroppedImages.length) {
            submit(supplied);
            return;
          }
          const url = extractImageUrl(event.dataTransfer);
          if (url) importUrl(url);
          else if (supplied.length) submit(supplied);
          else onRejected?.("Use a JPG, PNG, WebP, GIF, or SVG image.");
        }}
        onPaste={(event) => {
          if (disabled || importing) return;
          const clipboardFiles = Array.from(event.clipboardData.items || [])
            .filter((item) => item.kind === "file")
            .map((item) => item.getAsFile())
            .filter(Boolean);
          if (clipboardFiles.length) {
            event.preventDefault();
            submit(clipboardFiles);
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
          accept=".jpg,.jpeg,.png,.webp,.gif,.svg,image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          multiple={multiple}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
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
        {helperText ? `${helperText} ` : `${multiple ? "Multiple images" : "One image"}. `}
        JPG, PNG, WebP, GIF, or SVG · 5 MB maximum each. URL import depends on the source website allowing CORS.
      </span>
    </div>
  );
}
