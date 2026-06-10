---
title: 'Computed Properties'
description: 'Computed properties let you declaratively derive state from other reactive data, with automatic caching for efficiency.'
outline: [2, 3]
---

# Computed Properties

**Feature showcase: raw HTML (`<mark>`, `<kbd>`, `<abbr>`) and `outline: [2, 3]` frontmatter.**

Template expressions are convenient, but they are meant for simple operations. Putting too much
logic in your templates can make them bloated and hard to maintain. For example, if we have an
object with a nested array:

```js
const author = reactive({
  name: 'John Doe',
  books: ['Vue 2 - Advanced Guide', 'Vue 3 - Basic Guide', 'Vue 4 - The Mystery'],
});
```

And we want to display different messages depending on whether `author` has published some books:

```html
<p>Has published books:</p>
<span>{{ author.books.length > 0 ? 'Yes' : 'No' }}</span>
```

At this point, the template is getting a bit cluttered. We have to look at it for a second before
realizing that it performs a calculation depending on `author.books`. More importantly, we
probably don't want to repeat ourselves if we need to include this calculation in the template
more than once.

That's why for complex logic that includes reactive data, it is recommended to use a
<mark>computed property</mark>.

## Basic Example

```vue
<script setup>
import { reactive, computed } from 'vue';

const author = reactive({
  name: 'John Doe',
  books: ['Vue 2 - Advanced Guide', 'Vue 3 - Basic Guide', 'Vue 4 - The Mystery'],
});

// a computed ref
const publishedBooksMessage = computed(() => {
  return author.books.length > 0 ? 'Yes' : 'No';
});
</script>

<template>
  <p>Has published books:</p>
  <span>{{ publishedBooksMessage }}</span>
</template>
```

Here we have declared a computed property `publishedBooksMessage`. The `computed()` function
expects a getter function, and the returned value is a <mark>computed ref</mark>. Similar to
normal refs, you can access the computed result as `publishedBooksMessage.value`. Computed refs
are also auto-unwrapped in templates so you can reference them without `.value` in template
expressions.

A computed property automatically tracks its reactive dependencies. Vue is aware that the
computation of `publishedBooksMessage` depends on `author.books`, so it will update any
bindings that depend on `publishedBooksMessage` when `author.books` changes.

## Computed Caching vs. Methods

You may have noticed we can achieve the same result by invoking a method in the expression:

```html
<p>{{ calculateBooksMessage() }}</p>
```

```js
// in component
function calculateBooksMessage() {
  return author.books.length > 0 ? 'Yes' : 'No';
}
```

Instead of a computed property, we can define the same function as a method. For the end result,
the two approaches are indeed exactly the same. However, the difference is that
<mark>computed properties are cached based on their reactive dependencies</mark>. A computed
property will only re-evaluate when some of its reactive dependencies have changed. This means
as long as `author.books` has not changed, multiple accesses to `publishedBooksMessage` will
immediately return the previously computed result without having to run the getter function again.

This also means the following computed property will never update, because `Date.now()` is not
a reactive dependency:

```js
const now = computed(() => Date.now());
```

In comparison, a method invocation will **always** run the function whenever a re-render happens.

Why do we need caching? Imagine we have an expensive computed property `list`, which requires
looping through a huge array and doing a lot of computations. Then we may have other computed
properties that in turn depend on `list`. Without caching, we would be executing `list`'s getter
many more times than necessary.

### When to Use a Method vs. a Computed Property

| Use case                               | Method       | Computed                             |
| -------------------------------------- | ------------ | ------------------------------------ |
| Result depends on reactive data        | ✗ Not cached | ✓ Cached until deps change           |
| Side effects needed (logs, API calls)  | ✓            | ✗ Avoid side effects in getters      |
| Called in event handlers               | ✓            | ✗ Not designed for direct invocation |
| Value displayed in template reactively | ✓ Works      | ✓ Preferred — more efficient         |

## Writable Computed

Computed properties are by default getter-only. If you attempt to assign a new value to a
computed property, you will receive a runtime warning. In the rare cases where you need a
"writable" computed property, you can create one by providing both a getter and a setter:

```vue
<script setup>
import { ref, computed } from 'vue';

const firstName = ref('John');
const lastName = ref('Doe');

const fullName = computed({
  // getter
  get() {
    return firstName.value + ' ' + lastName.value;
  },
  // setter
  set(newValue) {
    // Note: we are using destructuring assignment syntax here.
    [firstName.value, lastName.value] = newValue.split(' ');
  },
});
</script>
```

Now when you run `fullName.value = 'John Doe'`, the setter will be invoked and `firstName` and
`lastName` will be updated accordingly.

## Best Practices

### Getters should be side-effect free

It is important to remember that computed getter functions should only perform pure computation
and be free of side effects. For example, <abbr title="Don't make network requests, mutate DOM, or modify other reactive state inside a computed getter">don't make async requests or mutate the DOM</abbr> inside a computed getter. Think of a computed property as declaratively describing how to derive a value based on other values — its only
responsibility should be computing and returning that value.

You can press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>I</kbd> (or <kbd>Cmd</kbd>+<kbd>Opt</kbd>+<kbd>I</kbd> on Mac) to open DevTools and inspect the reactivity graph in the Vue panel.

### Avoid mutating computed value

The returned value from a computed property is derived state. Think of it as a temporary snapshot
— every time the source state changes, a new snapshot is created. It does not make sense to
mutate a snapshot, so a computed return value should be treated as read-only and never mutated.
Update the source state it depends on to trigger new computations.

---

Related pages:

- [Reactivity Fundamentals](ReactivityFundamentals.md) — `ref()` and `reactive()` basics
- [Template Syntax](TemplateSyntax.md) — using computed values in templates
