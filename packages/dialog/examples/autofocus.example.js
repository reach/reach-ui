import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Autofocus";

export let Example = () => (
  <Component
    initialState={{ showDialog: false }}
    refs={{ button: React.createRef() }}
  >
    {({ state, setState, refs }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

        <Dialog isOpen={state.showDialog} initialFocusRef={refs.button}>
          <button onClick={() => setState({ showDialog: false })}>
            Close Dialog
          </button>
          <button ref={refs.button}>Auto focused</button>
        </Dialog>
      </div>
    )}
  </Component>
);
