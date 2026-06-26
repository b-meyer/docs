<script setup lang="ts">
import type { PageFrontmatter } from '../composables/useFrontmatter';
import { headFromFrontmatter } from '../runtime/headFromFrontmatter';

type HeroAction = { text: string; link: string; theme?: 'brand' | 'alt' };
type Hero = {
  name?: string;
  text?: string;
  tagline?: string;
  image?: string;
  actions?: HeroAction[];
};
type Feature = { icon?: string; title?: string; details?: string; link?: string };

const props = defineProps<{ frontmatter?: PageFrontmatter }>();

headFromFrontmatter(props.frontmatter);

// Frontmatter values are typed `unknown` on PageFrontmatter; narrow here.
const hero = (props.frontmatter?.hero ?? {}) as Hero;
const features = (props.frontmatter?.features ?? []) as Feature[];
</script>

<template>
  <div class="mx-auto w-full max-w-[1152px] px-6 py-12 md:py-20">
    <!-- Hero -->
    <section class="flex flex-col items-center gap-6 text-center md:gap-8">
      <img v-if="hero.image" :src="hero.image" alt="" class="size-24 md:size-28" />
      <div class="space-y-3">
        <h1 v-if="hero.name" class="text-primary-500 text-4xl font-bold tracking-tight md:text-6xl">
          {{ hero.name }}
        </h1>
        <p v-if="hero.text" class="text-3xl font-bold tracking-tight text-gray-900 md:text-5xl">
          {{ hero.text }}
        </p>
        <p v-if="hero.tagline" class="mx-auto max-w-[60ch] text-lg text-gray-600 md:text-xl">
          {{ hero.tagline }}
        </p>
      </div>
      <div v-if="hero.actions?.length" class="flex flex-wrap items-center justify-center gap-3">
        <RouterLink
          v-for="action in hero.actions"
          :key="action.link"
          :to="action.link"
          :class="[
            'rounded-full px-6 py-2.5 text-sm font-semibold transition-colors',
            action.theme === 'alt'
              ? 'hover:border-primary-400 border border-gray-300 text-gray-900'
              : 'bg-primary-500 hover:bg-primary-600 text-white',
          ]"
        >
          {{ action.text }}
        </RouterLink>
      </div>
    </section>

    <!-- Features -->
    <section v-if="features.length" class="mt-14 flex flex-wrap justify-center gap-4 md:mt-20">
      <component
        :is="feature.link ? 'RouterLink' : 'div'"
        v-for="(feature, i) in features"
        :key="feature.title ?? i"
        :to="feature.link"
        class="bg-gray-25 block w-full rounded-xl border border-gray-200 p-6 transition-colors sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
        :class="feature.link ? 'hover:border-primary-400' : ''"
      >
        <div
          v-if="feature.icon"
          class="bg-primary-50 mb-4 inline-flex size-11 items-center justify-center rounded-lg text-2xl"
          aria-hidden="true"
        >
          {{ feature.icon }}
        </div>
        <h2 v-if="feature.title" class="text-base font-semibold text-gray-900">
          {{ feature.title }}
        </h2>
        <p v-if="feature.details" class="mt-2 text-sm leading-relaxed text-gray-600">
          {{ feature.details }}
        </p>
      </component>
    </section>

    <!-- Optional markdown body below the grid -->
    <article class="prose prose-gray mx-auto mt-16 max-w-[88ch]">
      <slot />
    </article>
  </div>
</template>
