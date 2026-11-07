import { create } from 'zustand';
import {
  reconcileTimedAttempt,
  startTimedAttempt,
  transitionTimedAttempt,
} from '../features/exam/timed/engine';
import type { TimedAttempt, TimedCommand } from '../features/exam/timed/engine';
import { timedContext } from '../features/exam/timed/profile';
import type { TimedContext } from '../features/exam/timed/profile';
import {
  restoreTimedAttempt,
  serializeTimedAttempt,
  TIMED_STORAGE_KEY,
} from '../features/exam/timed/persistence';
import type { AttemptStorage } from '../features/exam/timed/persistence';

interface TimedPracticeState {
  attempt: TimedAttempt | null;
  hydrated: boolean;
  recoveryError: string | null;
  storageWarning: string | null;
  hydrate: (force?: boolean) => void;
  begin: () => void;
  tick: () => void;
  dispatch: (command: TimedCommand) => void;
  reset: () => void;
}

export function createTimedPracticeStore(dependencies: {
  clock: () => number;
  storage: () => AttemptStorage;
  context: TimedContext;
  newId: () => string;
}) {
  const { clock, storage, context, newId } = dependencies;
  return create<TimedPracticeState>((set, get) => {
    const write = (attempt: TimedAttempt) =>
      storage().setItem(TIMED_STORAGE_KEY, serializeTimedAttempt(attempt));
    const apply = (attempt: TimedAttempt) => {
      if (attempt === get().attempt) return;
      let storageWarning: string | null = null;
      try {
        write(attempt);
      } catch {
        storageWarning =
          'Changes could not be saved in this browser. Keep this tab open; recent responses or final submission may not survive refresh.';
      }
      set({ attempt, storageWarning });
    };
    return {
      attempt: null,
      hydrated: false,
      recoveryError: null,
      storageWarning: null,
      hydrate: (force = false) => {
        if (get().hydrated && !force) return;
        try {
          const raw = storage().getItem(TIMED_STORAGE_KEY);
          const attempt =
            raw === null ? null : restoreTimedAttempt(raw, context, clock());
          set({
            attempt,
            hydrated: true,
            recoveryError: null,
            storageWarning: null,
          });
          if (attempt) {
            try {
              write(attempt);
            } catch {
              set({
                storageWarning:
                  'Recovered practice could not be saved. Keep this tab open.',
              });
            }
          }
        } catch {
          set({
            attempt: null,
            hydrated: true,
            recoveryError:
              'Saved timed practice is corrupt, unsupported, outdated, or browser storage is unavailable. It was not scored. Reset this local practice record to begin again.',
            storageWarning: null,
          });
        }
      },
      begin: () => {
        get().hydrate();
        if (get().recoveryError) return;
        const current = get().attempt;
        if (current?.status === 'in-progress') {
          apply(reconcileTimedAttempt(current, clock()));
          return;
        }
        const attempt = startTimedAttempt(newId(), context, clock());
        try {
          write(attempt);
          set({ attempt, storageWarning: null });
        } catch {
          set({
            recoveryError:
              'Browser storage is unavailable. The timed mock was not started. Enable local storage and reset to retry.',
          });
        }
      },
      tick: () => {
        const attempt = get().attempt;
        if (attempt) apply(reconcileTimedAttempt(attempt, clock()));
      },
      dispatch: (command) => {
        const attempt = get().attempt;
        if (attempt)
          apply(transitionTimedAttempt(attempt, command, clock(), context));
      },
      reset: () => {
        try {
          storage().removeItem(TIMED_STORAGE_KEY);
          set({
            attempt: null,
            hydrated: true,
            recoveryError: null,
            storageWarning: null,
          });
        } catch {
          set({
            recoveryError:
              'Browser storage could not be reset. Enable local storage and retry.',
          });
        }
      },
    };
  });
}

export const useTimedPracticeStore = createTimedPracticeStore({
  clock: () => Date.now(),
  storage: () => window.localStorage,
  context: timedContext,
  newId: () => crypto.randomUUID(),
});
