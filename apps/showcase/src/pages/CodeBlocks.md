---
title: 'Code Blocks'
description: 'Shiki syntax highlighting, code groups, snippet imports, and notation transformers.'
---

# Code Blocks

**Feature showcase: Shiki syntax highlighting, code groups, snippet imports, and notation
transformers.**

## Syntax Highlighting

TypeScript:

```ts
interface User {
  id: number;
  name: string;
}

async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json() as Promise<User>;
}
```

Vue SFC:

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>

<template>
  <button @click="count++">Count: {{ count }} — doubled: {{ doubled }}</button>
</template>
```

CSS:

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
```

Bash:

```bash
# Install, build, and preview
pnpm install
pnpm run build
pnpm run preview
```

JSON:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

## Code Groups

The same operation expressed in multiple languages — tabs let readers jump to their
preferred language.

::: code-group

```ts [TypeScript]
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<User>;
}
```

```js [JavaScript]
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

```bash [curl]
curl -f https://api.example.com/users/42
```

:::

Package manager install commands:

::: code-group

```bash [pnpm]
pnpm add shiki @shikijs/transformers
```

```bash [npm]
npm install shiki @shikijs/transformers
```

```bash [yarn]
yarn add shiki @shikijs/transformers
```

:::

## Notation Transformers

### Diff — `// [!code ++]` / `// [!code --]`

```ts
function greet(name: string): string {
  return `Hello, ${name}!`; // [!code --]
  return `Hi there, ${name}!`; // [!code ++]
}
```

### Focus — `// [!code focus]`

Draws attention to the key lines; hover to reveal the rest.

```ts
import { computed, ref } from 'vue'; // [!code focus]

const items = ref<string[]>([]);

const sorted = computed(() => [...items.value].sort()); // [!code focus]
```

### Error Levels — `// [!code error]` / `// [!code warning]`

```ts
const user = undefined;
console.log(user.name); // [!code error]
const config = null;
console.log(config?.debug); // [!code warning]
```

### Line Highlights via Meta

Highlight ranges with `{n}` or `{n-m}` after the language tag:

```ts{1,4-6}
import { ref, computed } from 'vue';

const base = ref(10);
const squared = computed(() => base.value ** 2);
const cubed = computed(() => base.value ** 3);
const quad = computed(() => base.value ** 4);
```

## Snippet Imports

Import an entire file:

<<< ./snippets/example.ts

Import just the `fetch-user` region:

<<< ./snippets/example.ts#fetch-user

Import just the `greet` region:

<<< ./snippets/example.ts#greet
