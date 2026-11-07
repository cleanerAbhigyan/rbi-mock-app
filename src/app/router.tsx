import { Link, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Dashboard } from '../features/exam/Dashboard';
import { DemoInstructions } from '../features/exam/DemoInstructions';
import { DemoExam } from '../features/exam/DemoExam';
import { QuestionBankPage } from '../features/questions/QuestionBankPage';
import { TimedInstructions } from '../features/exam/timed/TimedInstructions';
import { TimedExam } from '../features/exam/timed/TimedExam';
import { TimedResults } from '../features/exam/timed/TimedResults';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="question-bank" element={<QuestionBankPage />} />
        <Route path="demo/instructions" element={<DemoInstructions />} />
        <Route path="demo/exam" element={<DemoExam />} />
        <Route path="demo/timed/instructions" element={<TimedInstructions />} />
        <Route path="demo/timed/exam" element={<TimedExam />} />
        <Route path="demo/timed/results" element={<TimedResults />} />
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
