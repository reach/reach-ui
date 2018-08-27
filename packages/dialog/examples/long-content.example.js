import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Long Content";

export let Example = () => (
  <Component initialState={{ showDialog: false }}>
    {({ state, setState }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

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
