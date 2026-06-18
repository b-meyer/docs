---
title: 'Component Basics'
description: 'Components let you split the UI into independent, reusable pieces. This page covers defining, using, and communicating between components.'
---

# Component Basics

**Feature showcase: all four callout containers plus `:::details` (collapsible).**

Components allow us to split the UI into independent, reusable pieces, and think about each
piece in isolation. It's common for an app to be organized into a tree of nested components.

## Defining a Component

When using a build step, we typically define each Vue component in a dedicated file using the
`.vue` extension — known as a Single-File Component (SFC):

```vue
<script setup>
import { ref } from 'vue';

const count = ref(0);
</script>

<template>
  <button @click="count++">You clicked me {{ count }} times.</button>
</template>
```

When not using a build step, a Vue component can be defined as a plain JavaScript object
containing Vue-specific options:

```js
import { ref } from 'vue';

export default {
  setup() {
    const count = ref(0);
    return { count };
  },
  template: `
    <button @click="count++">
      You clicked me {{ count }} times.
    </button>`,
};
```

:::tip
Single-File Components are the recommended authoring format for any non-trivial application.
They co-locate template, logic, and styles in one file, making components easier to reason
about and maintain.
:::

## Using a Component

To use a child component, we need to import it in the parent component:

```vue
<script setup>
import ButtonCounter from './ButtonCounter.vue';
</script>

<template>
  <h1>Here is a child component!</h1>
  <ButtonCounter />
</template>
```

With `<script setup>`, imported components are automatically made available to the template.

It's also possible to globally register a component, making it available to all components in
the application without having to import it. The pros and cons of global vs. local registration
are discussed in the Component Registration section.

:::info
Components can be reused as many times as you want. Each instance maintains its own, separate
state — clicking one counter does not affect the other counters:

```html
<ButtonCounter />
<ButtonCounter />
<ButtonCounter />
```

Each instance has its own independent `count`.
:::

## Passing Props

If we want to pass a piece of data (the blog post title, for example) to the child component,
we can use **props**. Props are custom attributes you can register on a component.

```vue
<!-- BlogPost.vue -->
<script setup>
defineProps(['title']);
</script>

<template>
  <h4>{{ title }}</h4>
</template>
```

`defineProps` is a compile-time macro that is only available inside `<script setup>` and does
not need to be explicitly imported. Declared props are automatically exposed to the template.
`defineProps` also returns an object that contains all the props passed to the component, so
that we can access them in JavaScript if needed:

```js
const props = defineProps(['title']);
console.log(props.title);
```

:::warning
Avoid mutating a prop directly inside a child component. Vue will warn you in the console if
you attempt it, because it breaks the one-way data flow contract. When you need to transform
a prop value, derive it with a computed property instead.
:::

## Listening to Events

As we develop our `<BlogPost>` component, some features may require communicating back up to the
parent. For example, we may decide to include an accessibility feature to enlarge the text of
blog posts, while leaving the rest of the page at its default size.

In the parent, we can support this feature by adding a `postFontSize` data property:

```vue
<script setup>
import { ref } from 'vue';
import BlogPost from './BlogPost.vue';

const posts = ref([
  /* ... */
]);
const postFontSize = ref(1);
</script>

<template>
  <div :style="{ fontSize: postFontSize + 'em' }">
    <BlogPost
      v-for="post in posts"
      :key="post.id"
      :title="post.title"
      @enlarge-text="postFontSize += 0.1"
    />
  </div>
</template>
```

The child component can emit an event by calling the built-in `$emit` method, passing the name
of the event. The parent component can then listen to it via `v-on`:

```vue
<!-- BlogPost.vue -->
<script setup>
defineProps(['title']);
defineEmits(['enlarge-text']);
</script>

<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <button @click="$emit('enlarge-text')">Enlarge text</button>
  </div>
</template>
```

:::danger
Do not use camelCase event names on the child with hyphenated listeners on the parent — or vice
versa. Vue does normalize these, but mixing conventions creates subtle bugs in some edge cases
(particularly with native DOM event fallthrough). Pick one casing strategy across the codebase
and stick to it. `defineEmits(['enlargeText'])` paired with `@enlarge-text` is fine; what breaks
is when the mismatch spans a build boundary (e.g., a pre-compiled library).
:::

## Content Distribution with Slots

Just like HTML elements, it's often useful to be able to pass content to a component, like this:

```html
<AlertBox> Something bad happened. </AlertBox>
```

This can be achieved using the `<slot>` element:

```vue
<!-- AlertBox.vue -->
<template>
  <div class="alert-box">
    <strong>Error!</strong>
    <br />
    <slot />
  </div>
</template>
```

As you'll see above, we use the `<slot>` as a placeholder where we want the content to go — and
that's it. We're done!

:::details Advanced: v-model on a component

`v-model` can also be used on a component to implement two-way binding.

```vue
<CustomInput v-model="searchText" />
```

Under the hood, this is equivalent to:

```html
<CustomInput :model-value="searchText" @update:model-value="newValue => searchText = newValue" />
```

For this to work, the component needs to:

1. Bind the `value` attribute of a native `<input>` element to the `modelValue` prop
2. On a native `input` event, emit an `update:modelValue` event with the new value

```vue
<!-- CustomInput.vue -->
<script setup>
defineProps(['modelValue']);
defineEmits(['update:modelValue']);
</script>

<template>
  <input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />
</template>
```

With Vue 3.4+, the recommended approach is `defineModel()`:

```vue
<script setup>
const model = defineModel();
</script>

<template>
  <input v-model="model" />
</template>
```

:::

---

Related pages:

- [Template Syntax](TemplateSyntax.md) — binding data and listening to events in templates
- [Lifecycle Hooks](LifecycleHooks.md) — what happens when a component mounts and unmounts
