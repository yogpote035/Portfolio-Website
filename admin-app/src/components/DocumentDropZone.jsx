import { useId, useRef, useState } from "react";
import { Icon } from "./ui.jsx";

const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx"]);
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function validateResume(file) {
  if (!file) return "Choose a resume file.";
  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension) || (file.type && !ALLOWED_TYPES.has(file.type))) {
    return "Use a PDF, DOC, or DOCX file.";
  }
  if (file.size > MAX_RESUME_SIZE) return "Resume files must be 10 MB or smaller.";
  return "";
}

export default function DocumentDropZone({ file, onFile, onRejected, disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const submit = (files) => {
    const nextFile = Array.from(files || [])[0];
    const error = validateResume(nextFile);
    if (error) {
      onRejected?.(error);
      return;
    }
    onRejected?.("");
    onFile(nextFile);
  };

  return (
    <div className="admin-upload-control">
      <span className="admin-upload-label">
        Resume file <span className="cms-required-mark" aria-hidden="true">*</span>
      </span>
      <div
        className={`admin-image-dropzone admin-document-dropzone${dragging ? " is-dragging" : ""}${disabled ? " is-disabled" : ""}`}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-required="true"
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
          if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) submit(event.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          className="admin-upload-native-input"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            submit(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="admin-dropzone-icon"><Icon name="resumes" size={22} /></span>
        <span>
          <strong>{dragging ? "Drop resume here" : file ? "Choose another resume" : "Choose or drop a resume"}</strong>
          <small>{file ? file.name : "PDF, DOC, or DOCX"}</small>
        </span>
      </div>
      <span id={`${inputId}-help`} className="admin-help-text">
        One document · PDF, DOC, or DOCX · 10 MB maximum.
      </span>
    </div>
  );
}
