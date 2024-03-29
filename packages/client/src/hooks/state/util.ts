import { useCallback, useSyncExternalStore } from 'react';

const emptyState = Symbol('EmptyState');
const noQuickRes = Symbol('NoQuickRes');

type StateKey = string | number;

export const createGlobalState = <
  TValue,
  TStateKey extends StateKey = StateKey,
>(
  defaultOrGetDefault?:
    | TValue
    | Promise<TValue>
    | ((key?: TStateKey) => TValue | Promise<TValue>),
) => {
  type TValOrPromise = TValue | Promise<TValue>;
  type TValOrUpdate = TValOrPromise | ((cur: TValOrPromise) => TValOrPromise);

  type Setter = {
    (valueOrSetter: TValOrUpdate, key?: TStateKey): TValOrPromise;
  };

  type SubscriberCallback = (
    newValue: TValOrPromise,
    oldValue: TValOrPromise,
  ) => void;

  const stateMap = new Map<TStateKey, TValOrPromise>();
  const subscribersMap = new Map<TStateKey, Set<SubscriberCallback>>();

  const getDefault = (key?: TStateKey) =>
    typeof defaultOrGetDefault === 'function'
      ? (defaultOrGetDefault as (key?: TStateKey) => TValOrPromise)(key)
      : defaultOrGetDefault;

  const set: Setter = async (valueOrSetter, key) => {
    let newValue =
      typeof valueOrSetter === 'function'
        ? (valueOrSetter as (cur: TValOrPromise) => TValOrPromise)(getRaw(key))
        : valueOrSetter;

    const oldValue = getRaw(key);

    if (newValue === emptyState) {
      stateMap.delete(key);
    } else {
      if (stateMap.has(key)) {
        const quickRes = await Promise.race([
          newValue,
          new Promise<typeof noQuickRes>((r) => {
            setTimeout(() => r(noQuickRes), 100);
          }),
        ]);

        if (quickRes !== noQuickRes) {
          newValue = quickRes;
        }
      }

      stateMap.set(key, newValue);

      if (newValue instanceof Promise) {
        newValue.then((res) => {
          set(res, key);
        });
      }
    }

    const subscribers = subscribersMap.get(key);

    if (subscribers) {
      for (const subscriberCallback of subscribers) {
        try {
          subscriberCallback(newValue, oldValue);
        } catch (e) {
          console.error('Error in state change callback:', e);
        }
      }
    }

    return newValue;
  };

  const reset = (key?: TStateKey) => set(emptyState as TValOrUpdate, key);

  const getRaw = (key?: TStateKey) => stateMap.get(key);

  const get = (key?: TStateKey) => {
    if (!stateMap.has(key)) {
      set(getDefault(key), key);
    }

    return getRaw(key);
  };

  /**
   * @throws If the state is in pending state
   * @returns Current state value
   */
  const getSnapshot = (key?: TStateKey) => {
    const snapshot = get(key);

    if (snapshot instanceof Promise) throw snapshot;

    return snapshot;
  };

  const subscribe = (cb: SubscriberCallback, key?: TStateKey) => {
    if (!subscribersMap.has(key)) {
      subscribersMap.set(key, new Set());
    }

    const subs = subscribersMap.get(key);
    subs.add(cb);

    return () => {
      const subs = subscribersMap.get(key);

      if (subs) {
        subs.delete(cb);

        if (subs.size === 0) {
          subscribersMap.delete(key);
        }
      }
    };
  };

  const useExternalState = (key?: TStateKey) => {
    const subscribeByKey = useCallback(
      (cb: () => void) => subscribe(cb, key),
      [key],
    );

    const getSnapshotByKey = useCallback(() => getSnapshot(key), [key]);

    return useSyncExternalStore(subscribeByKey, getSnapshotByKey);
  };

  return { useExternalState, get, set, reset, subscribe, getSnapshot, getRaw };
};
