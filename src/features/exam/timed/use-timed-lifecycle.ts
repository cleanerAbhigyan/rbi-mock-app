import { useEffect } from 'react';
import { useTimedPracticeStore } from '../../../stores/timed-practice-store';
import { TIMED_STORAGE_KEY } from './persistence';

/** The interval only requests reconciliation; elapsed time is always derived from deadlines. */
export function useTimedLifecycle() {
  const hydrate = useTimedPracticeStore((s) => s.hydrate);
  const tick = useTimedPracticeStore((s) => s.tick);
  useEffect(() => {
    hydrate();
    tick();
    const interval = window.setInterval(tick, 1000);
    const sync = () => tick();
    const storage = (event: StorageEvent) => {
      if (event.key === TIMED_STORAGE_KEY || event.key === null) hydrate(true);
    };
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('storage', storage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('storage', storage);
    };
  }, [hydrate, tick]);
}
