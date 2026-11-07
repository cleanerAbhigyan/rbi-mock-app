import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const title =
      (
        {
          '/': 'Dashboard',
          '/question-bank': 'Question bank',
          '/demo/instructions': 'Demo instructions',
          '/demo/exam': 'Phase I demo',
          '/demo/timed/instructions': 'Timed practice instructions',
          '/demo/timed/exam': 'Timed practice',
          '/demo/timed/results': 'Timed practice results',
        } as Record<string, string>
      )[pathname] ?? 'Page not found';
    document.title = `${title} | RBI Grade B Mock Exam Simulator`;
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
        <span>Phase 1B · Custom practice</span>
      </footer>
    </div>
  );
}
