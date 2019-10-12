import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "@reach/dialog";

export let name = "Long Content";

export let Example = () => (
  <Component initialState={{ showDialog: false }}>
    {({ state, setState }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

        {new Array(20).fill(1).map((x, index) => (
          <div style={{ position: "absolute", top: (index + 1) * 100 + "px" }}>
            - scroll -
          </div>
        ))}

        <Dialog isOpen={state.showDialog}>
          <button onClick={() => setState({ showDialog: false })}>
            Close Dialog
          </button>
          <p>Yikes!</p>
          <div style={{ height: 3000 }} />
          <button>Ayyyyyy</button>
        </Dialog>
      </div>
    )}
  </Component>
);
