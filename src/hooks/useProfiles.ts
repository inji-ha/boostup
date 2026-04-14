import { useCallback, useMemo, useState } from "react";
import type { Profile } from "../types";
import { SEED_PROFILES } from "../data/seedProfiles";

const STORAGE_ME = "sanhu-donggi-my-profile";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useProfiles() {
  const [me, setMeState] = useState<Profile | null>(() =>
    loadJson<Profile | null>(STORAGE_ME, null),
  );

  const allOthers = useMemo(
    () => SEED_PROFILES.filter((p) => p.id !== me?.id),
    [me?.id],
  );

  const setMe = useCallback((p: Profile | null) => {
    setMeState(p);
    if (p) saveJson(STORAGE_ME, p);
    else localStorage.removeItem(STORAGE_ME);
  }, []);

  return { me, setMe, allOthers };
}
