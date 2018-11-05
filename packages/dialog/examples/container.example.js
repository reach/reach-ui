import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Specific container element";

export let Example = () => (
  <Component
    getRefs={() => ({
      container: React.createRef()
    })}
    initialState={{ showDialog: false }}
  >
    {({ state, setState, refs }) => (
      <React.Fragment>
        <div ref={refs.container} />

        <div>
          <button onClick={() => setState({ showDialog: true })}>
            Show Dialog
          </button>

          <Dialog container={refs.container} isOpen={state.showDialog}>
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
      </React.Fragment>
    )}
  </Component>
);
