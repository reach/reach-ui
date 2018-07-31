import React from "react";
import Component from "../index";

export let name = "Basic State";

export let Example = () => (
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
