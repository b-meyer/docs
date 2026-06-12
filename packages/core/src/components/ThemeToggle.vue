<script setup lang="ts">
import { MoonIcon, SunIcon, SwatchIcon } from '@heroicons/vue/24/outline';
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  SliderRange,
  SliderRoot,
  SliderThumb,
  SliderTrack,
  SwitchRoot,
  SwitchThumb,
} from 'reka-ui';
import { computed } from 'vue';
import { useTheme } from '../composables/useTheme';

const { theme, hue, intensity, setTheme, setHue, setIntensity } = useTheme();

function onThemeUpdate(v: boolean): void {
  setTheme(v ? 'dark' : 'light');
}
function onHueUpdate(v: number[] | undefined): void {
  const next = v?.[0];
  if (next !== undefined) setHue(next);
}
function onIntensityUpdate(v: number[] | undefined): void {
  const next = v?.[0];
  if (next !== undefined) setIntensity(next);
}

const hueTrackStyle =
  'background: linear-gradient(to right, hsl(0 65% 50%), hsl(60 65% 50%), hsl(120 65% 50%), hsl(180 65% 50%), hsl(240 65% 50%), hsl(300 65% 50%), hsl(360 65% 50%))';

const intensityTrackStyle = computed(
  () =>
    `background: linear-gradient(to right, hsl(${hue.value} 15% 50%), hsl(${hue.value} 85% 50%))`,
);
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger
      aria-label="Theme settings"
      class="inline-flex size-10 ml-auto items-center justify-center rounded text-gray-700 hover:bg-primary-50"
    >
      <SwatchIcon class="size-5" aria-hidden="true" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :side-offset="16"
        align="end"
        class="z-50 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:bg-gray-125"
      >
        <div class="eyebrow mb-2">Appearance</div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-900">
            {{ theme === 'dark' ? 'Dark' : 'Light' }} mode
          </span>
          <SwitchRoot
            :model-value="theme === 'dark'"
            aria-label="Toggle dark mode"
            class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 data-[state=checked]:bg-primary-500 data-[state=checked]:hover:bg-primary-600"
            @update:model-value="onThemeUpdate"
          >
            <SwitchThumb
              class="flex size-5 translate-x-1 items-center justify-center rounded-full bg-white shadow ring-1 ring-gray-300 transition-transform will-change-transform data-[state=checked]:translate-x-6"
            >
              <SunIcon
                v-if="theme === 'light'"
                class="size-3 text-primary-400"
                aria-hidden="true"
              />
              <MoonIcon v-else class="size-3 text-primary-700" aria-hidden="true" />
            </SwitchThumb>
          </SwitchRoot>
        </div>

        <hr class="my-4 border-gray-200" />

        <div class="mb-2 flex items-baseline justify-between">
          <span class="eyebrow">Hue</span>
          <span class="font-mono text-xs text-gray-500">{{ hue }}°</span>
        </div>
        <SliderRoot
          :model-value="[hue]"
          :min="0"
          :max="360"
          :step="1"
          aria-label="Hue"
          class="relative flex h-5 w-full touch-none items-center select-none"
          @update:model-value="onHueUpdate"
        >
          <SliderTrack class="relative h-2 grow rounded-full" :style="hueTrackStyle">
            <SliderRange class="absolute h-full rounded-full bg-transparent" />
          </SliderTrack>
          <SliderThumb
            class="block size-4 cursor-grab rounded-full bg-white shadow ring-1 ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:outline-none"
            aria-label="Hue"
          />
        </SliderRoot>

        <div class="mt-4 mb-2 flex items-baseline justify-between">
          <span class="eyebrow">Intensity</span>
          <span class="font-mono text-xs text-gray-500">{{ intensity }}%</span>
        </div>
        <SliderRoot
          :model-value="[intensity]"
          :min="0"
          :max="100"
          :step="1"
          aria-label="Intensity"
          class="relative flex h-5 w-full touch-none items-center select-none"
          @update:model-value="onIntensityUpdate"
        >
          <SliderTrack class="relative h-2 grow rounded-full" :style="intensityTrackStyle">
            <SliderRange class="absolute h-full rounded-full bg-transparent" />
          </SliderTrack>
          <SliderThumb
            class="block size-4 cursor-grab rounded-full bg-white shadow ring-1 ring-primary-500 focus-visible:ring-2 focus-visible:ring-primary-700 focus-visible:outline-none"
            aria-label="Saturation"
          />
        </SliderRoot>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
