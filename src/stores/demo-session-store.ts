import { create } from 'zustand';
import { demoProfile, demoQuestions } from '../features/exam/demo-profile';
import {
  startDemoSession,
  transitionDemoSession,
} from '../features/exam/demo-session';
import type {
  DemoAction,
  DemoCommand,
  DemoSession,
} from '../features/exam/demo-session';

interface DemoSessionStore {
  session: DemoSession | null;
  beginDemo: () => void;
  dispatch: (action: DemoCommand) => void;
}

/** Memory only: no localStorage, timer, submission or scoring state. */
export const useDemoSessionStore = create<DemoSessionStore>((set) => ({
  session: null,
  beginDemo: () =>
    set({ session: startDemoSession(demoProfile.id, demoQuestions) }),
  dispatch: (command) => {
    const action: DemoAction =
      command.type === 'save-and-next' || command.type === 'review-and-next'
        ? { ...command, savedAt: new Date().toISOString() }
        : command;
    set((state) =>
      state.session
        ? {
            session: transitionDemoSession(
              state.session,
              action,
              demoQuestions,
            ),
          }
        : state,
    );
  },
}));
