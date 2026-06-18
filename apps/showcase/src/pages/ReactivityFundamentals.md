---
title: 'Reactivity Fundamentals'
description: 'Vue 3 reactivity with ref() and reactive() — how the system tracks changes and the common pitfalls to avoid.'
---

# Reactivity Fundamentals

**Feature showcase: all five GitHub-style alert types.**

Vue's reactivity system is what makes the framework "live" — when reactive data changes, the
view updates automatically. Vue 3 exposes this system via the Composition API's `ref()` and
`reactive()` helpers.

## Declaring Reactive State with `ref()`

In the Composition API, the recommended way to declare reactive state is to use the `ref()`
function:

```js
import { ref } from 'vue';

const count = ref(0);
```

`ref()` takes the argument and returns it wrapped within a ref object with a `.value` property:

```js
const count = ref(0);

console.log(count); // { value: 0 }
console.log(count.value); // 0

count.value++;
console.log(count.value); // 1
```

> [!NOTE]
> A ref wraps the value in a plain object with a single `.value` property. This is why you must
> read and write `count.value` in JavaScript — the ref object itself is just the reactive wrapper.

When you use a ref in a component's template, Vue automatically unwraps it so you don't need
`.value` in the template:

```html
<template>
  <button @click="increment">{{ count }}</button>
</template>

<script setup>
  import { ref } from 'vue';

  const count = ref(0);

  function increment() {
    count.value++;
  }
</script>
```

> [!TIP]
> For simple primitives (numbers, strings, booleans) and arrays, `ref()` is the default choice.
> Use it even if you could use `reactive()` — the consistency of always using `ref()` makes code
> easier to reason about.

## Deep Reactivity

Refs can hold any value type, including deeply nested objects, arrays, or JavaScript built-in
data structures like `Map`. A ref will make its value deeply reactive — meaning changes nested
deep inside an object will be detected:

```js
import { ref } from 'vue';

const obj = ref({
  nested: { count: 0 },
  arr: ['foo', 'bar'],
});

function mutateDeeply() {
  // these will work as expected.
  obj.value.nested.count++;
  obj.value.arr.push('baz');
}
```

## Reactive Objects with `reactive()`

There is another way to declare reactive state, with the `reactive()` API. Unlike a ref which
wraps the inner value in a special object, `reactive()` makes an object itself reactive:

```js
import { reactive } from 'vue';

const state = reactive({ count: 0 });
```

Usage in template:

```html
<button @click="state.count++">{{ state.count }}</button>
```

> [!IMPORTANT]
> Destructuring a property from a `reactive()` object — or passing that property into a function
> — breaks the reactivity link. The destructured variable holds a copy of the primitive value,
> not a live reference to the reactive source.
>
> ```js
> const state = reactive({ count: 0 });
>
> // count is now a plain number, disconnected from state.count
> let { count } = state;
>
> // does NOT affect state.count
> count++;
> ```
>
> Use `toRefs()` to destructure while preserving reactivity: `const { count } = toRefs(state)`

## Limitations of `reactive()`

The `reactive()` API has a few limitations:

1. **It only works for object types** (objects, arrays, and collection types such as `Map` and
   `Set`). It cannot hold primitive types such as `string`, `number`, or `boolean`.

2. **We cannot replace the entire reactive object.** If we try to directly replace the whole
   object, the original reactive reference is lost:

> [!WARNING]
> Directly assigning to a variable that holds a `reactive()` object replaces the reactive proxy
> with a plain object. Vue loses track of the original reference and updates to the new object
> will not be detected.
>
> ```js
> let state = reactive({ count: 0 });
>
> // this loses reactivity — state is now a plain { count: 1 } object
> state = reactive({ count: 1 });
> ```

3. **Not destructuring-friendly.** See the [IMPORTANT note above](#reactive-objects-with-reactive)
   about destructuring.

Because of these limitations, it is recommended to use `ref()` as the primary API for declaring
reactive state.

## Reactivity Transform (Experimental)

> [!CAUTION]
> The Reactivity Transform feature was experimental and has been removed as of Vue 3.4. Do not
> use `$ref()`, `$computed()`, or `$$()` — these compile-time macros are no longer available.
> Any code using them will silently fail or throw at compile time with newer Vue versions.
>
> Migrate by replacing every `$ref(x)` with `ref(x)` and re-adding `.value` where needed.

## Why Refs Instead of Plain Variables?

You might be wondering why we need refs with the `.value` instead of just plain variables. To
understand this, we need to briefly discuss how Vue's reactivity system works.

When you use a ref in a template, and later change the ref's value, Vue automatically detects
the change and updates the DOM accordingly. This is made possible with a dependency-tracking
based reactivity system. When a component is rendered for the first time, Vue **tracks** every
ref that was used during the render. Later, when a ref is mutated, it will **trigger** a
re-render for components that are tracking it.

In standard JavaScript, there is no way to detect the access or mutation of plain variables.
However, we can intercept the get and set operations of an object's properties using getter and
setter methods. The `.value` property gives Vue the opportunity to detect when a ref has been
accessed or mutated.

---

Next: [Component Basics](ComponentBasics.md) — building and composing Vue single-file components.
