import PropsTable from '../components/PropsTable'
import Component from '../../packages/component-component'

# Component

A dynamic version of `React.Component`, a component component if you will. Useful for inline lifecycles and state. It's also incredibly composable and used in many other Reach components.

```.jsx
<Component initialState={{ hue: 0 }}>
  {({ setState, state }) => (
    <div
      style={{
        background: `hsl(${state.hue}, 50%, 50%)`,
        padding: 20,
        textAlign: "center"
      }}
    >
      <button onClick={() => setState({ hue: Math.random() * 360 })}>
        Click me!
      </button>
    </div>
  )}
</Component>
```

## Props

| Prop                                                  | Type   |
| ----------------------------------------------------- | ------ |
| [initialState](#initialstate)                         | object |  |
| [ getInitialState ](#getinitialstate)                 | func   |
| [ refs ](#refs)                                       | object |
| [ getRefs ](#getRefs)                                 | func   |
| [ didMount ](#didmount)                               | func   |
| [ didUpdate ](#didupdate)                             | func   |
| [ willUnmount ](willunmount)                          | func   |
| [ getSnapshotBeforeUpdate ](#getSnapshotBeforeUpdate) | func   |
| [ shouldUpdate ](#shouldupdate)                       | func   |
| [ render ](#render)                                   | func   |
| [ children ](#children)                               | func   |

### initialState

Type: `object`

An object of initial state.

```.jsx
<Component initialState={{ count: 10 }}>
  {({ state }) => <div>Count is {state.count}</div>}
</Component>
```

### getInitialState

Type: `func: () => object`

A function to return intitial state. Use this when initial state is computed. In the following example, `Date.now()` is called every render but only the first computation is in state.

```.jsx
<Component initialState={{ now: Date.now() }}>
  {({ state }) => <div>Now is: {state.now}</div>}
</Component>
```

Since the state is computed, it's better to use `getInitialState`, so that we don't compute `Date.now()` every render needlessly:

```.jsx
<Component getInitialState={() => ({ now: Date.now() })}>
  {({ state }) => <div>Now is: {state.now}</div>}
</Component>
```

### refs

Type: `object`

Put any refs you need to keep track of here, stuff like DOM nodes, timers, and subcriptions.

```.jsx
<Component refs={{ input: React.createRef() }}>
  {({ refs }) => (
    <form onSubmit={(event) => {
      event.preventDefault()
      alert(refs.input.current.value)
    }}>
      <input ref={refs.input} /> <button type="submit">Go</button>
    </form>
  )}
</Component>
```

### getRefs

`() => object`

Use this when any of your refs are computed.

```jsx
<Component
  getRefs={() => {
    return {
      popupContainer: document.createElement("div")
    };
  }}
/>
```

### didMount

`({ state, props, refs, setState, forceUpdate }) => undefined`

Called when the component mounts. See [TODO React Docs].

### didUpdate

`({ state, props, refs, setState, forceUpdate, nextProps, nextState }) => undefined`

Called when the component updates. See [TODO React Docs].

### willUnmount

`({ state, props, refs }) => undefined`

Called when the component will be removed from the page. See [TODO React Docs].

### getSnapshotBeforeUpdate

`({ state, props, refs, prevProps, prevState }) => any`

See [TODO React Docs].

### shouldUpdate

`({ state, props, nextProps, nextState }) => bool`

See [TODO React Docs].

### render

`({ state, props, refs, setState, forceUpdate }) => node`

### children

`({ state, props, refs, setState, forceUpdate }) => node`

## Examples

```.jsx
<Component initialState={{ hue: 0 }}>
  {({ setState, state }) => (
    <div
      style={{
        background: `hsl(${state.hue}, 50%, 50%)`,
        padding: 20,
        textAlign: "center"
      }}
    >
      <button onClick={() => setState({ hue: Math.random() * 360 })}>
        Click me!
      </button>
    </div>
  )}
</Component>
```

## Installation

```bash
npm install @reach/component
# or
yarn add @reach/component
```

And then import it:

```js
import Component from "@reach/component";
```

## Examples

Let's say you want some async data but don't want to make a whole new component just for the lifecycles to get it:

```.jsx
<Component
  initialState={{ gists: null }}
  didMount={({ setState }) => {
    fetch("https://api.github.com/gists?per_page=5")
      .then(res => res.json())
      .then(gists => setState({ gists }));
  }}
>
  {({ state }) =>
    state.gists ? (
      <ul>
        {state.gists.map(gist => <li key={gist.id}>{gist.description}</li>)}
      </ul>
    ) : (
      <div>Loading...</div>
    )
  }
</Component>
```

Or maybe you need a little bit of state but an entirely new component
seems a bit heavy:

```.jsx
<Component initialState={{ count: 0 }}>
  {({ setState, state }) => (
    <div>
      <button
        onClick={() =>
          setState(state => ({ count: state.count - 1 }))
        }
      >
        -
      </button>
      <span> {state.count} </span>
      <button
        onClick={() =>
          setState(state => ({ count: state.count + 1 }))
        }
      >
        +
      </button>
    </div>
  )}
</Component>
```

## Props

You know all of these already:

- `didMount({ state, setState, props, forceUpdate })`
- `shouldUpdate({ state, props, nextProps, nextState })`
- `didUpdate({ state, setState, props, forceUpdate, prevProps, prevState })`
- `willUnmount({ state, props })`
- `children({ state, setState, props, forceUpdate })`
- `render({ state, setState, props, forceUpdate })`
