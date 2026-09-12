import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { logout } from "../utils/authClient.js";
import { Button, Icon } from "./ui.jsx";
const groups = [
  ["Overview", [["Dashboard", "/", "dashboard"]]],
  [
    "Content",
    [
      ["Profile", "/profile", "profile"],
      ["Projects", "/projects", "projects"],
      ["Skills", "/skills", "skills"],
      ["Experience", "/experience", "experience"],
      ["Education", "/education", "education"],
    ],
  ],
  ["Inbox", [["Contacts", "/contacts", "contacts"]]],
  ["Assets", [["Resumes", "/resumes", "resumes"]]],
];
export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("cms-sidebar") === "collapsed",
  );
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("cms-theme") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
  );
  const drawer = useRef(null);
  const segments = pathname.split("/").filter(Boolean);
  const label =
    groups
      .flatMap((group) => group[1])
      .find((item) => item[1] === `/${segments[0]}`)?.[0] || "Dashboard";
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("cms-theme", theme);
  }, [theme]);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
    document.title = `${label} · Portfolio CMS`;
  }, [pathname, label]);
  useEffect(() => {
    if (open) drawer.current.showModal();
    else drawer.current.close();
    const previous = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  useEffect(() => {
    const media = matchMedia("(min-width: 769px)");
    const close = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  const navigation = (
    <>
      <Link className="admin-brand" to="/" aria-label="Portfolio CMS dashboard">
        <span className="admin-brand-mark">
          p<span>·</span>
        </span>
        <span className="cms-nav-label">
          <strong>Portfolio</strong>
          <small>Content workspace</small>
        </span>
      </Link>
      <nav className="admin-sidebar-nav" aria-label="Main navigation">
        {groups.map(([group, items]) => (
          <div className="cms-nav-group" key={group}>
            <p className="cms-nav-label">{group}</p>
            {items.map(([text, to, icon]) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                title={text}
                className={({ isActive }) =>
                  `admin-sidebar-link${isActive ? " active" : ""}`
                }
              >
                <Icon name={icon} />
                <span className="cms-nav-label">{text}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="cms-sidebar-footer">
        <div className="cms-workspace-note cms-nav-label">
          <span className="cms-live-dot" /> Your portfolio, in focus.
          <small>Make your next update count.</small>
        </div>
        <button
          className="admin-sidebar-link"
          title="Log out"
          onClick={handleLogout}
        >
          <Icon name="logout" />
          <span className="cms-nav-label">Log out</span>
        </button>
      </div>
    </>
  );
  return (
    <div className={`admin-shell${collapsed ? " cms-collapsed" : ""}`}>
      <a className="cms-skip" href="#main-content">
        Skip to content
      </a>
      <aside className="admin-sidebar">{navigation}</aside>
      <dialog
        ref={drawer}
        className="cms-mobile-drawer"
        aria-label="Navigation"
        onCancel={() => setOpen(false)}
      >
        <Button
          variant="ghost"
          className="cms-drawer-close"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        >
          <Icon name="close" />
        </Button>
        {navigation}
      </dialog>
      <div className="admin-main">
        <header className="admin-main-header">
          <div className="cms-topbar-start">
            <Button
              variant="ghost"
              className="cms-desktop-toggle"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() =>
                setCollapsed((value) => {
                  localStorage.setItem(
                    "cms-sidebar",
                    value ? "expanded" : "collapsed",
                  );
                  return !value;
                })
              }
            >
              <Icon name="collapse" />
            </Button>
            <Button
              variant="ghost"
              className="cms-mobile-toggle"
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Icon name="menu" />
            </Button>
            <nav className="admin-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Workspace</Link>
              <span>/</span>
              <Link to={segments.length ? `/${segments[0]}` : "/"}>
                {label}
              </Link>
              {segments.length > 1 && (
                <>
                  <span>/</span>
                  <span aria-current="page">
                    {segments.includes("history")
                      ? "History"
                      : segments.includes("edit")
                        ? "Edit"
                        : segments.includes("new")
                          ? "Create"
                          : "Details"}
                  </span>
                </>
              )}
            </nav>
          </div>
          <div className="cms-topbar-actions">
            <Button
              variant="ghost"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Icon name={theme === "light" ? "moon" : "sun"} />
            </Button>
            <span className="cms-topbar-divider" />
            <Link
              className="cms-account"
              to="/profile"
              aria-label="View portfolio profile"
            >
              <span className="cms-avatar">P</span>
              <span>
                Administrator<small>Portfolio CMS</small>
              </span>
            </Link>
          </div>
        </header>
        <main id="main-content" className="admin-page-content" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="cms-footer">
          Portfolio CMS <span>A little care. A better portfolio.</span>
        </footer>
      </div>
    </div>
  );
}
