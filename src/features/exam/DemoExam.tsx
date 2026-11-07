import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useDemoSessionStore } from '../../stores/demo-session-store';
import { demoProfile, demoQuestions } from './demo-profile';
import { QuestionEditor } from './components/QuestionEditor';
import { QuestionPalette } from './components/QuestionPalette';
import { SectionTabs } from './components/SectionTabs';

export function DemoExam() {
  const session = useDemoSessionStore((state) => state.session);
  const dispatch = useDemoSessionStore((state) => state.dispatch);
  useEffect(() => () => dispatch({ type: 'discard-draft' }), [dispatch]);

  if (!session) return <Navigate to="/demo/instructions" replace />;
  const question = demoQuestions.find(
    (item) => item.id === session.activeQuestionId,
  )!;
  const section = demoProfile.sections.find((item) =>
    item.questionIds.includes(question.id),
  )!;
  const index = demoQuestions.findIndex((item) => item.id === question.id);
  const sectionNumber = section.questionIds.indexOf(question.id) + 1;

  return (
    <div className="demo-exam">
      <header className="exam-header">
        <div>
          <p className="demo-label">DEMO PRACTICE — NOT ACTUAL RBI PYQs</p>
          <h1>RBI Grade B Phase I — Demo</h1>
          <p role="status" className="exam-progress">
            {section.title} · Question {sectionNumber} of{' '}
            {section.questionIds.length} · Overall {index + 1} of{' '}
            {demoQuestions.length}
          </p>
        </div>
        <span className="untimed-label">Untimed · Unscored</span>
      </header>
      <SectionTabs
        sections={demoProfile.sections}
        activeSectionId={section.id}
        onSelect={(target) =>
          dispatch({ type: 'navigate', questionId: target.questionIds[0]! })
        }
      />
      {demoProfile.sections.map((item) => (
        <div
          key={item.id}
          id={`panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${item.id}`}
          hidden={item.id !== section.id}
        >
          {item.id === section.id ? (
            <div className="candidate-grid">
              <QuestionEditor
                question={question}
                session={session}
                sectionNumber={sectionNumber}
                globalIndex={index}
                totalQuestions={demoQuestions.length}
                dispatch={dispatch}
              />
              <QuestionPalette
                session={session}
                section={section}
                onNavigate={(questionId) =>
                  dispatch({ type: 'navigate', questionId })
                }
              />
            </div>
          ) : null}
        </div>
      ))}
      <div className="exam-session-note">
        <p>
          In memory only. Refreshing resets this demo. No submission or results
          are available.
        </p>
        <Link className="text-link" to="/demo/instructions">
          Instructions / start a fresh demo →
        </Link>
      </div>
    </div>
  );
}
