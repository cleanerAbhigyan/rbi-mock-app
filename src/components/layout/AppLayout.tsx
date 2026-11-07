import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    document.title = `${pathname === '/question-bank' ? 'Question bank' : 'Dashboard'} | RBI Grade B Mock Exam Simulator`;
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <NavLink
            to="/"
            className="brand"
            aria-label="RBI Grade B practice dashboard"
          >
            <span className="brand-mark" aria-hidden="true">
              B<span>Ⅲ</span>
            </span>
            <span>
              GRADE B<span className="brand-subtitle">PRACTICE WORKSPACE</span>
            </span>
          </NavLink>
          <nav aria-label="Main navigation">
            <NavLink to="/" end>
              Dashboard
            </NavLink>
            <NavLink to="/question-bank">Question bank</NavLink>
          </nav>
          <span className="local-label">
            <span aria-hidden="true" />
            Local-first
          </span>
        </div>
      </header>
      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="main-content"
      >
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Independent personal practice. Not official RBI or IBPS software; not
          affiliated with or endorsed by either organization.
        </p>
        <span>Foundation · v0.1.0</span>
      </footer>
    </div>
  );
}
