import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Dashboard } from '../features/exam/Dashboard';
import { QuestionBankPage } from '../features/questions/QuestionBankPage';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="question-bank" element={<QuestionBankPage />} />
        <Route
          path="*"
          element={
            <section className="panel empty-state">
              <p className="eyebrow">Page not found</p>
              <h1>This page is unavailable.</h1>
              <Link className="text-link" to="/">
                Return to dashboard →
              </Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
