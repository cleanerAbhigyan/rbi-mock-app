import { describe, expect, it } from 'vitest';
import { createTimedPracticeStore } from '../src/stores/timed-practice-store';
import { timedContext } from '../src/features/exam/timed/profile';
import { TIMED_STORAGE_KEY } from '../src/features/exam/timed/persistence';
import type { AttemptStorage } from '../src/features/exam/timed/persistence';

function setup() {
  let now = 1000;
  const data = new Map<string, string>();
  const storage: AttemptStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
  const make = () =>
    createTimedPracticeStore({
      clock: () => now,
      storage: () => storage,
      context: timedContext,
      newId: () => 'store-attempt',
    });
  return {
    make,
    data,
    storage,
    setNow: (time: number) => {
      now = time;
    },
  };
}

describe('timed store persistence adapter', () => {
  it('does not start a timer on hydration and refuses to restart a live attempt', () => {
    const { make, setNow } = setup();
    const store = make();
    store.getState().hydrate();
    expect(store.getState().attempt).toBeNull();
    store.getState().begin();
    const original = store.getState().attempt!;
    setNow(5000);
    store.getState().begin();
    expect(store.getState().attempt!.startedAtMs).toBe(original.startedAtMs);
    expect(store.getState().attempt!.schedule).toEqual(original.schedule);
  });

  it('round-trips saved responses and flags across new store instances without drafts/deadline reset', () => {
    const { make, setNow } = setup();
    const store = make();
    store.getState().begin();
    store.getState().dispatch({ type: 'select', optionId: 'a' });
    store.getState().dispatch({ type: 'review-and-next' });
    store.getState().dispatch({ type: 'select', optionId: 'd' });
    setNow(10000);
    const recovered = make();
    recovered.getState().hydrate();
    expect(
      Object.keys(recovered.getState().attempt!.session.savedResponses),
    ).toHaveLength(1);
    expect(
      recovered.getState().attempt!.session.draft.selectedOptionId,
    ).toBeNull();
    expect(
      Object.values(recovered.getState().attempt!.session.reviewFlags),
    ).toEqual(['marked-for-review']);
    expect(recovered.getState().attempt!.schedule).toEqual(
      store.getState().attempt!.schedule,
    );
    setNow(999999);
    const expired = make();
    expired.getState().hydrate();
    expect(expired.getState().attempt!.submissionReason).toBe('timeout');
  });

  it('retains only the latest submitted record and freezes it across repeated ticks/commands', () => {
    const { make, data, setNow } = setup();
    const store = make();
    store.getState().begin();
    store.getState().dispatch({ type: 'submit' });
    const saved = data.get(TIMED_STORAGE_KEY);
    setNow(999999);
    store.getState().tick();
    store.getState().dispatch({ type: 'submit' });
    expect(data.size).toBe(1);
    expect(data.get(TIMED_STORAGE_KEY)).toBe(saved);
    store.getState().begin();
    expect(data.size).toBe(1);
  });

  it('quarantines invalid data without deleting it and resets only its own key on explicit recovery', () => {
    const { make, data } = setup();
    data.set(TIMED_STORAGE_KEY, '{broken');
    data.set('other-app', 'keep');
    const store = make();
    store.getState().hydrate();
    expect(store.getState().recoveryError).toMatch(/corrupt/);
    expect(store.getState().attempt).toBeNull();
    store.getState().begin();
    expect(store.getState().attempt).toBeNull();
    expect(data.get(TIMED_STORAGE_KEY)).toBe('{broken');
    store.getState().reset();
    expect(data.has(TIMED_STORAGE_KEY)).toBe(false);
    expect(data.get('other-app')).toBe('keep');
    store.getState().begin();
    expect(store.getState().attempt?.status).toBe('in-progress');
  });

  it('blocks starting without storage and warns if writes fail mid-attempt', () => {
    const { storage } = setup();
    const denied = createTimedPracticeStore({
      context: timedContext,
      clock: () => 1000,
      newId: () => 'denied',
      storage: () => {
        throw new Error('denied');
      },
    });
    denied.getState().begin();
    expect(denied.getState().attempt).toBeNull();
    expect(denied.getState().recoveryError).toBeTruthy();
    let fail = false;
    const store = createTimedPracticeStore({
      context: timedContext,
      clock: () => 1000,
      newId: () => 'write-test',
      storage: () => ({
        ...storage,
        setItem: (key, value) => {
          if (fail) throw new Error('quota');
          storage.setItem(key, value);
        },
      }),
    });
    store.getState().begin();
    fail = true;
    store.getState().dispatch({ type: 'select', optionId: 'a' });
    expect(store.getState().storageWarning).toMatch(/could not be saved/);
    expect(store.getState().attempt!.session.draft.selectedOptionId).toBe('a');
  });
});
