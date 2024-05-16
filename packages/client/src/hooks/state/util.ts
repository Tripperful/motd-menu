import { useCallback, useSyncExternalStore } from 'react';

const emptyState = Symbol('EmptyState');

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
  type TValOrPromise<TValue> = TValue | Promise<TValue>;
  type TValOrUpdate<TValue> =
    | TValOrPromise<TValue>
    | ((cur: TValOrPromise<TValue>) => TValOrPromise<TValue>);

  type Setter<TValue> = {
    (
      valueOrSetter: TValOrUpdate<TValue>,
      key?: TStateKey,
    ): TValOrPromise<TValue>;
  };

  type SubscriberCallback = (
    newValue: TValOrPromise<TValue>,
    oldValue: TValOrPromise<TValue>,
  ) => void;

  const stateMap = new Map<TStateKey, TValOrPromise<TValue>>();
  const subscribersMap = new Map<TStateKey, Set<SubscriberCallback>>();

  const getDefault = (key?: TStateKey) =>
    typeof defaultOrGetDefault === 'function'
      ? (defaultOrGetDefault as (key?: TStateKey) => TValOrPromise<TValue>)(key)
      : defaultOrGetDefault;

  const getRaw = (key?: TStateKey) => stateMap.get(key);

  const set: Setter<TValue> = async (valueOrSetter, key) => {
    const oldValue = getRaw(key);

    const newValue =
      typeof valueOrSetter === 'function'
        ? (
            valueOrSetter as (
              cur: TValOrPromise<TValue>,
            ) => TValOrPromise<TValue>
          )(getRaw(key))
        : valueOrSetter;

    if (oldValue === newValue) {
      return newValue;
    }

    if (newValue === emptyState) {
      stateMap.delete(key);
    } else {
      stateMap.set(key, newValue);

      if (newValue instanceof Promise) {
        newValue.then((res) => {
          // If our original promise is still the current
          // value, then  set the resolved value
          const curValue = getRaw(key);
          if (curValue === newValue) {
            set(res, key);
          }
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

  const reset = (key?: TStateKey) =>
    set(emptyState as TValOrUpdate<TValue>, key);

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
