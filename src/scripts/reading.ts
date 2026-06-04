import { ref } from 'vue';

const STORAGE_KEY = 'show-additional';

function readBool(key: string, fallback: boolean): boolean {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  return raw === 'true';
}

const showAdditional = ref<boolean>(false);

if (typeof window !== 'undefined') {
  showAdditional.value = readBool(STORAGE_KEY, false);
}

function setShowAdditional(v: boolean): void {
  showAdditional.value = v;
  localStorage.setItem(STORAGE_KEY, String(v));
}

export function useReadingMode() {
  return { showAdditional, setShowAdditional };
}
