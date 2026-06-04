import { ref } from 'vue';

type Theme = 'light' | 'dark';

// Hard fallbacks if neither localStorage nor a resolved CSS custom property is
// available. Consumers set their real defaults in `tokens`/`index.html` (the
// `--brand-hue` / `--brand-intensity` custom properties); we read those so the
// sliders start where the consumer's CSS actually rendered, not at a baked-in 210.
const HUE_FALLBACK = 210;
const INTENSITY_FALLBACK = 50;

function readNumber(key: string, fallback: number, min: number, max: number): number {
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}

/** Read a `<html>`-level CSS custom property as a number, or `fallback` if unset/invalid. */
function cssDefault(prop: string, fallback: number): number {
  if (typeof document === 'undefined') return fallback;
  const v = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(prop));
  return Number.isFinite(v) ? v : fallback;
}

// SSR-safe defaults at module load; reconciled to the persisted/DOM state on
// the client below. The inline bootstrap in index.html applies the same values
// to <html> before Vue hydrates, so no flash-of-wrong-theme is expected.
const theme = ref<Theme>('light');
const hue = ref<number>(HUE_FALLBACK);
const intensity = ref<number>(INTENSITY_FALLBACK);

if (typeof window !== 'undefined') {
  theme.value = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  // CSS `--brand-intensity` is 0–1; the slider/localStorage scale is 0–100.
  const intensityDefault = Math.round(
    cssDefault('--brand-intensity', INTENSITY_FALLBACK / 100) * 100,
  );
  hue.value = readNumber('brand-hue', cssDefault('--brand-hue', HUE_FALLBACK), 0, 360);
  intensity.value = readNumber('brand-intensity', intensityDefault, 0, 100);
}

function setTheme(t: Theme): void {
  theme.value = t;
  localStorage.setItem('theme', t);
  document.documentElement.classList.toggle('dark', t === 'dark');
}

function setHue(h: number): void {
  hue.value = h;
  localStorage.setItem('brand-hue', String(h));
  document.documentElement.style.setProperty('--brand-hue', String(h));
}

function setIntensity(i: number): void {
  intensity.value = i;
  localStorage.setItem('brand-intensity', String(i));
  document.documentElement.style.setProperty('--brand-intensity', String(i / 100));
}

export function useTheme() {
  return { theme, hue, intensity, setTheme, setHue, setIntensity };
}
