import { ref } from 'vue';

const STORAGE_KEY = 'show-additional';

function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
}

// SSR-safe default. The persisted value is applied on the client via
// `syncFromStorage()` (called from a component's onMounted), NOT at module load —
// so the server render and the initial client render always agree (no hydration
// mismatch), and the persisted preference takes effect right after mount.
const showAdditional = ref<boolean>(false);

function syncFromStorage(): void {
  if (typeof window === 'undefined') return;
  showAdditional.value = readBool(STORAGE_KEY, false);
}

function setShowAdditional(v: boolean): void {
  showAdditional.value = v;
  // Reachable from a component setup that also runs during SSG prerender, where
  // `localStorage` is undefined. (The ref still updates.)
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, String(v));
}

export function useReadingMode() {
  return { showAdditional, setShowAdditional, syncFromStorage };
}
