---
title: 'Template Syntax'
description: 'Vue uses an HTML-based template syntax that declaratively binds the rendered DOM to the underlying component instance data.'
---

# Template Syntax

**Feature showcase: code fences (multi-language) and tables.**

Vue uses an HTML-based template syntax that lets you declaratively bind the rendered DOM to the
underlying component instance's data. All Vue templates are syntactically valid HTML that can be
parsed by spec-compliant browsers and HTML parsers.

Under the hood, Vue compiles the templates into highly optimized JavaScript code. Combined with
the reactivity system, Vue can figure out the minimal number of components to re-render and apply
the minimal amount of DOM manipulations when the app state changes.

## Text Interpolation

The most basic form of data binding is text interpolation using the "Mustache" syntax — double
curly braces:

```html
<span>Message: {{ msg }}</span>
```

The mustache tag will be replaced with the value of the `msg` property from the corresponding
component instance. It will also be updated whenever the `msg` property changes.

## Raw HTML

The double mustaches interpret data as plain text, not HTML. In order to output real HTML, you
need the `v-html` directive:

```html
<p>Using text interpolation: {{ rawHtml }}</p>
<p>Using v-html directive: <span v-html="rawHtml"></span></p>
```

> [!WARNING]
> Dynamically rendering arbitrary HTML on your website can be very dangerous because it can
> easily lead to XSS vulnerabilities. Only use `v-html` on trusted content and **never** on
> user-provided content.

## Attribute Bindings

Mustaches cannot be used inside HTML attributes. Instead, use a `v-bind` directive:

```html
<div v-bind:id="dynamicId"></div>
```

The `v-bind` directive instructs Vue to keep the element's `id` attribute in sync with the
component's `dynamicId` property. The shorthand syntax drops the `v-bind:` prefix:

```html
<div :id="dynamicId"></div>
```

### Boolean Attributes

Boolean attributes are attributes that can indicate true / false values by their presence on
an element. `v-bind` works a bit differently in this case:

```html
<button :disabled="isButtonDisabled">Button</button>
```

The `disabled` attribute will be included if `isButtonDisabled` has a truthy value. It will also
be included if the value is an empty string, maintaining consistency with `<button disabled="">`.
For other falsy values the attribute will be omitted.

### Dynamically Binding Multiple Attributes

If you have a JavaScript object representing multiple attributes that looks like this:

```js
const objectOfAttrs = {
  id: 'container',
  class: 'wrapper',
  style: 'background-color: green',
};
```

You can bind them to a single element using `v-bind` without an argument:

```html
<div v-bind="objectOfAttrs"></div>
```

## JavaScript Expressions

Vue actually supports the full power of JavaScript expressions inside all data bindings:

```html
{{ number + 1 }} {{ ok ? 'YES' : 'NO' }} {{ message.split('').reverse().join('') }}

<div :id="`list-${id}`"></div>
```

These expressions will be evaluated as JavaScript in the data scope of the current component
instance. Each binding can only contain **a single expression** — a statement that evaluates to
a value.

```html
<!-- this is a statement, not an expression: -->
{{ var a = 1 }}

<!-- flow control won't work either, use ternary expressions -->
{{ if (ok) { return message } }}
```

## Directives

Directives are special attributes with the `v-` prefix. Vue provides a number of
[built-in directives](https://vuejs.org/api/built-in-directives.html).

A directive's job is to reactively apply updates to the DOM when its expression's value changes.
Take `v-if` as an example:

```html
<p v-if="seen">Now you see me</p>
```

Here, the `v-if` directive would remove / insert the `<p>` element based on the truthiness of the
value of the expression `seen`.

### Arguments

Some directives can take an "argument", denoted by a colon after the directive name. For example,
the `v-bind` directive is used to reactively update an HTML attribute:

```html
<a v-bind:href="url"> ... </a>

<!-- shorthand -->
<a :href="url"> ... </a>
```

Here `href` is the argument, which tells the `v-bind` directive to bind the element's `href`
attribute to the value of the expression `url`. In the shorthand, everything before the argument
(i.e., `v-bind:`) is condensed into a single character `:`.

Another example is the `v-on` directive, which listens to DOM events:

```html
<a v-on:click="doSomething"> ... </a>

<!-- shorthand -->
<a @click="doSomething"> ... </a>
```

### Event Modifiers

The `v-on` directive accepts modifiers — special postfixes denoted by a dot — that indicate the
event should be handled in a specific way:

| Modifier   | Behavior                                                |
| ---------- | ------------------------------------------------------- |
| `.stop`    | Calls `event.stopPropagation()`                         |
| `.prevent` | Calls `event.preventDefault()`                          |
| `.self`    | Only trigger if event was dispatched from this element  |
| `.capture` | Use capture mode when adding the listener               |
| `.once`    | Trigger at most once                                    |
| `.passive` | Attaches a passive event listener (`{ passive: true }`) |

```html
<!-- the click event's propagation will be stopped -->
<a @click.stop="doThis"></a>

<!-- the submit event will no longer reload the page -->
<form @submit.prevent="onSubmit"></form>

<!-- modifiers can be chained -->
<a @click.stop.prevent="doThat"></a>
```

### Key Modifiers

When listening for keyboard events you often need to check for specific keys. Vue allows adding
key modifiers for `v-on` when listening for key events:

```html
<!-- only call `submit` when the `key` is `Enter` -->
<input @keyup.enter="submit" />
```

| Modifier  | Key                 |
| --------- | ------------------- |
| `.enter`  | Enter               |
| `.tab`    | Tab                 |
| `.delete` | Delete or Backspace |
| `.esc`    | Escape              |
| `.space`  | Space               |
| `.up`     | Arrow Up            |
| `.down`   | Arrow Down          |
| `.left`   | Arrow Left          |
| `.right`  | Arrow Right         |

## Dynamic Arguments

It is also possible to use a JavaScript expression in a directive argument by wrapping it with
square brackets:

```html
<!--
  Note that there are some constraints to the argument expression,
  as explained in the "Dynamic Argument Value Constraints" and
  "Dynamic Argument Syntax Constraints" sections below.
-->
<a v-bind:[attributeName]="url"> ... </a>

<!-- shorthand -->
<a :[attributeName]="url"> ... </a>
```

Similarly, you can use dynamic arguments to bind a handler to a dynamic event name:

```html
<a v-on:[eventName]="doSomething"> ... </a>

<!-- shorthand -->
<a @[eventName]="doSomething"> ... </a>
```

### TypeScript Example

Here is how you would declare a component with typed props in TypeScript:

```ts
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    message: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const count = ref(0);
    return { count };
  },
});
```

---

Next: [Reactivity Fundamentals](ReactivityFundamentals.md) — how Vue tracks and responds to data
changes.
