import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Basic";

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
          <p>This is killer!</p>
          <input type="text" />
          <br />
          <input type="text" />
          <button>Ayyyyyy</button>
        </Dialog>
      </div>
    )}
  </Component>
);
