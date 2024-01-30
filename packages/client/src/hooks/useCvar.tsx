import debounce from 'lodash/debounce';
import React, {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useMount } from 'react-use';
import { motdApi } from 'src/api';
import { Cvar } from '@motd-menu/common';

interface CvarsContextData {
  cvars: Partial<Record<Cvar, string>>;
  setCvarLocal: (cvar: Cvar, value: string) => void;
  setCvar: (cvar: Cvar, value: string) => Promise<void>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const CvarsContext = createContext<CvarsContextData>(null);

const cvarFetchQueue: [Cvar, (value: string) => void][] = [];

const flushFetchCvarsDebounced = debounce(async () => {
  let cvars: Record<Cvar, string>;

  try {
    cvars = await motdApi.getCvars(...cvarFetchQueue?.map(([cvar]) => cvar));
  } finally {
    for (const [cvar, res] of cvarFetchQueue) {
      res(cvars?.[cvar]);
    }

    cvarFetchQueue.length = 0;
  }
}, 200);

const fetchCvarDebounced = (cvar: Cvar) =>
  new Promise<string>((res) => {
    cvarFetchQueue.push([cvar, res]);
    flushFetchCvarsDebounced();
  });

export const useCvar = (cvar: Cvar) => {
  const { cvars, setCvar, setCvarLocal, loading, setLoading } =
    useContext(CvarsContext);

  const setThisCvar = useCallback(
    (value: string) => {
      setCvar(cvar, value);
    },
    [setCvar, cvar],
  );

  useMount(async () => {
    setLoading(true);
    try {
      const value = await fetchCvarDebounced(cvar);
      setCvarLocal(cvar, value);
    } finally {
      setLoading(false);
    }
  });

  return [loading ? null : cvars[cvar], setThisCvar, loading] as const;
};

export const withCvars = <TProps,>(Component: FC<TProps>) => {
  const WithCvars: FC<TProps> = (props) => {
    const [cvars, setCvars] = useState<Partial<Record<Cvar, string>>>({});
    const [loading, setLoading] = useState(false);

    const setCvarLocal = useCallback((cvar: Cvar, value: string) => {
      setCvars((cur) => ({ ...cur, [cvar]: value }));
    }, []);

    const setCvar = useCallback(
      async (cvar: Cvar, value: string) => {
        try {
          await motdApi.setCvar(cvar, value);
        } finally {
          setCvarLocal(cvar, value);
        }
      },
      [setCvarLocal],
    );

    const ctx = useMemo(
      () => ({ cvars, setCvarLocal, setCvar, loading, setLoading }),
      [cvars, setCvarLocal, setCvar, loading, setLoading],
    );

    return (
      <CvarsContext.Provider value={ctx}>
        {Component(props)}
      </CvarsContext.Provider>
    );
  };

  return WithCvars;
};
