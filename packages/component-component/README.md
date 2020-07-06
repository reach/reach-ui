# @reach/component-component

[![Stable release](https://img.shields.io/npm/v/@reach/component-component.svg)](https://npm.im/@reach/component-component) ![MIT license](https://badgen.now.sh/badge/license/MIT)

[Docs](https://reach.tech/component-component) | [Source](https://github.com/reach/reach-ui/tree/main/packages/component-component)

> NOTE: This component was developed in the days before React Hooks.
> In most cases, you should probably build your function components using hooks and use a class
> component in the rare cases you need them. We may deprecate this component in the future.

A dynamic, functional version of `React.Component`, a component component if you will. Useful for inline lifecycles and state.

```jsx
<Component initialState={{ hue: 0 }}>
  {({ setState, state }) => (
    <div style={{ textAlign: "center" }}>
      <button onClick={() => setState({ hue: Math.random() * 360 })}>
        Generate Triad Colorscheme
      </button>
      <br />
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            display: "inline-block",
            margin: 10,
            width: "2em",
            height: "2em",
            borderRadius: "50%",
            background: `hsl(${state.hue + n * 120}, 50%, 50%)`,
            transition: "background-color 200ms ease",
          }}
        />
      ))}
    </div>
  )}
</Component>
```
