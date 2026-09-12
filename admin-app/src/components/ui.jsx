import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { Link } from "react-router-dom";
const paths = {
  dashboard: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  profile: "M20 21v-2a7 7 0 0 0-14 0v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  projects: "M3 7V4h6l3 3h9v13H3z",
  skills: "m8 5-6 7 6 7 M16 5l6 7-6 7 M14 3l-4 18",
  experience: "M3 7h18v14H3z M8 7V3h8v4 M3 12h18 M10 12v3h4v-3",
  education: "m2 9 10-6 10 6-10 6z M6 12v6l6 3 6-3v-6 M22 9v8",
  contacts: "M3 5h18v14H3z m0 0 9 7 9-7",
  resumes: "M5 2h9l5 5v15H5z M14 2v6h5 M9 12h6 M9 16h6",
  logout: "M9 3H3v18h6 M9 12h12 m-4-4 4 4-4 4",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  collapse: "M3 3h18v18H3z M8 3v18 m8-13-4 4 4 4",
  close: "m6 6 12 12 M6 18 18 6",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v2 M12 20v2 M2 12h2 M20 12h2 M5 5l1 1 M18 18l1 1 M5 19l1-1 M18 6l1-1",
  moon: "M20 14A9 9 0 0 1 10 3a9 9 0 1 0 10 11",
  arrow: "M5 12h14 m-5-5 5 5-5 5",
  plus: "M12 5v14 M5 12h14",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 m5 12 6 6",
  warning: "m12 3 10 18H2z M12 9v5 M12 17v1",
};
export function Icon({ name = "projects", size = 18, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.projects} />
    </svg>
  );
}
export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type="button"
      className={`cms-button cms-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
export function PageHeader({ title, description, actions, children }) {
  return (
    <div className="admin-dashboard-header">
      {children || (
        <>
          <div>
            <p className="cms-eyebrow">Portfolio workspace</p>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          {actions && <div className="admin-header-actions">{actions}</div>}
        </>
      )}
    </div>
  );
}
export function SectionHeader({ title, description, actions }) {
  return (
    <div className="cms-section-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </div>
  );
}
export function StatusBadge({ children, tone = "neutral" }) {
  return <span className={`admin-chip cms-badge-${tone}`}>{children}</span>;
}
export function EmptyState({
  title = "Nothing here yet",
  description,
  to,
  action,
}) {
  return (
    <div className="cms-empty">
      <span className="cms-empty-icon">
        <Icon size={24} />
      </span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {to && (
        <Link className="admin-link-button" to={to}>
          {action || "Create your first entry"}
          <Icon name="plus" size={16} />
        </Link>
      )}
    </div>
  );
}
export function ErrorState({ message, onRetry }) {
  return (
    <div className="form-error" role="alert">
      <Icon name="warning" />
      <div>
        <strong>Something went wrong</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
export function LoadingState({ rows = 4 }) {
  return (
    <div className="cms-skeleton" role="status" aria-label="Loading content">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} />
      ))}
    </div>
  );
}
export function StatCard({ icon, label, value, context, to }) {
  return (
    <Link to={to} className="cms-stat">
      <div className="cms-stat-top">
        <span>{label}</span>
        <Icon name={icon} />
      </div>
      <strong>{value ?? "—"}</strong>
      <div className="cms-stat-bottom">
        <span>{context}</span>
        <Icon name="arrow" size={16} />
      </div>
    </Link>
  );
}
export function DataTable({
  columns,
  rows,
  label,
  empty,
  rowClassName,
  loading = false,
}) {
  const [query, setQuery] = useState("");
  const visible = rows.filter(
    (row) =>
      !query ||
      columns.some((col) =>
        String(col.search ? col.search(row) : (row[col.key] ?? ""))
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
  );
  return (
    <div className="cms-data-panel">
      <div className="cms-table-toolbar">
        <strong>
          {label} <span className="cms-count">{rows.length}</span>
        </strong>
        <label className="cms-search">
          <Icon name="search" />
          <input
            type="search"
            aria-label={`Search ${label.toLowerCase()}`}
            placeholder={`Search ${label.toLowerCase()}…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {loading ? (
        <LoadingState />
      ) : !rows.length ? (
        empty || <EmptyState />
      ) : !visible.length ? (
        <EmptyState
          title="No matching results"
          description="Try another search term."
        />
      ) : (
        <div
          className="cms-table-scroll"
          tabIndex={0}
          role="region"
          aria-label={`${label} table`}
        >
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th scope="col" key={col.key}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id} className={rowClassName?.(row)}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export function FormField({ children, ...props }) {
  const id = useId();
  const parts = Children.toArray(children);
  const error = parts.find(
    (child) =>
      isValidElement(child) && child.props.className?.includes("field-error"),
  );
  return (
    <label {...props}>
      {parts.map((child) => {
        if (!isValidElement(child)) return child;
        if (["input", "select", "textarea"].includes(child.type))
          return cloneElement(child, {
            id: child.props.id || id,
            "aria-invalid": error ? true : undefined,
            "aria-describedby": error
              ? `${id}-error`
              : child.props["aria-describedby"],
          });
        if (child === error)
          return cloneElement(child, { id: `${id}-error`, role: "alert" });
        return child;
      })}
    </label>
  );
}
export function FormSection({ title, description, children }) {
  return (
    <section className="cms-form-section">
      <SectionHeader title={title} description={description} />
      <div className="cms-form-section-fields">{children}</div>
    </section>
  );
}
export function Modal({ title, children, onClose }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      className="cms-modal"
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="cms-section-header">
        <h2 id={titleId}>{title}</h2>
        <Button variant="ghost" aria-label="Close dialog" onClick={onClose}>
          <Icon name="close" />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
export function ConfirmDialog({ message, onConfirm, onCancel }) {
  const restore = /restore/i.test(message);
  return (
    <Modal
      title={restore ? "Restore saved version?" : "Delete this content?"}
      onClose={onCancel}
    >
      <p>{message}</p>
      <div className="cms-modal-actions">
        <Button variant="secondary" autoFocus onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={restore ? "primary" : "danger"} onClick={onConfirm}>
          {restore ? "Restore version" : "Delete permanently"}
        </Button>
      </div>
    </Modal>
  );
}
const ConfirmContext = createContext(null);
export const useConfirm = () => useContext(ConfirmContext);
export function ConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const pending = useRef(null);
  const returnFocus = useRef(null);
  useEffect(() => () => pending.current?.(false), []);
  const confirm = (message) =>
    new Promise((resolve) => {
      pending.current?.(false);
      pending.current = resolve;
      returnFocus.current = document.activeElement;
      setRequest(message);
    });
  const finish = (value) => {
    pending.current?.(value);
    pending.current = null;
    setRequest(null);
    requestAnimationFrame(() => returnFocus.current?.focus());
  };
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && (
        <ConfirmDialog
          message={request}
          onConfirm={() => finish(true)}
          onCancel={() => finish(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}
export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);
export function Toast({ message, onClose }) {
  return (
    <div className="cms-toast" role="status">
      <Icon name="activity" />
      <span>{message}</span>
      <Button
        variant="ghost"
        aria-label="Dismiss notification"
        onClick={onClose}
      >
        <Icon name="close" size={16} />
      </Button>
    </div>
  );
}
export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <ToastContext.Provider value={setMessage}>
      {children}
      {message && <Toast message={message} onClose={() => setMessage("")} />}
    </ToastContext.Provider>
  );
}
