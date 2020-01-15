import React from "react";
import Component from "@reach/component-component";

export let name = "Basic State";

export function Example() {
  return (
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
  );
}
