import { useEffect, useState } from "react";

type NetInfoState = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

type NetInfoModule = {
  fetch: () => Promise<unknown>;
  addEventListener?: (listener: (state: unknown) => void) => (() => void) | { remove: () => void };
};

const ONLINE_FALLBACK: NetInfoState = {
  isConnected: true,
  isInternetReachable: true,
};

let cachedModule: NetInfoModule | undefined;
let moduleChecked = false;

const normalizeState = (state: unknown): NetInfoState => {
  if (!state || typeof state !== "object") {
    return { ...ONLINE_FALLBACK };
  }

  const value = state as { isConnected?: unknown; isInternetReachable?: unknown };

  return {
    isConnected: typeof value.isConnected === "boolean" ? value.isConnected : null,
    isInternetReachable:
      typeof value.isInternetReachable === "boolean" ? value.isInternetReachable : null,
  };
};

const resolveModule = (): NetInfoModule | undefined => {
  if (moduleChecked) return cachedModule;
  moduleChecked = true;

  try {
    const required = require("@react-native-community/netinfo");
    const moduleCandidate = (required?.default ?? required) as NetInfoModule | undefined;
    if (moduleCandidate && typeof moduleCandidate.fetch === "function") {
      cachedModule = moduleCandidate;
      return cachedModule;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        "[netinfo] Native module unavailable, using safe fallback.",
        error
      );
    }
  }

  cachedModule = undefined;
  return undefined;
};

export const fetchNetInfo = async (): Promise<NetInfoState> => {
  const netInfoModule = resolveModule();
  if (!netInfoModule) {
    return { ...ONLINE_FALLBACK };
  }

  try {
    const state = await netInfoModule.fetch();
    return normalizeState(state);
  } catch {
    return { ...ONLINE_FALLBACK };
  }
};

export const useSafeNetInfo = (): NetInfoState => {
  const [state, setState] = useState<NetInfoState>(ONLINE_FALLBACK);

  useEffect(() => {
    let mounted = true;
    const netInfoModule = resolveModule();

    const applyState = (value: unknown) => {
      if (!mounted) return;
      setState(normalizeState(value));
    };

    if (netInfoModule?.addEventListener) {
      const subscription = netInfoModule.addEventListener(applyState);
      void fetchNetInfo().then(applyState);

      return () => {
        mounted = false;
        if (typeof subscription === "function") {
          subscription();
          return;
        }
        subscription?.remove?.();
      };
    }

    const timer = setInterval(() => {
      void fetchNetInfo().then(applyState);
    }, 15000);
    void fetchNetInfo().then(applyState);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return state;
};

