import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Dialog } from "../src/index";

export let name = "Aria Hides Content";

let setupMutationObserver = ({ refs }) => {
  console.log("mutation observer");
  let logMutation = action("Root Node Attribute Mutated");
  let observer = new MutationObserver(mutationsList => {
    for (var mutation of mutationsList) {
      console.log(mutation);
      logMutation(
        mutation.attributeName +
          ": " +
          mutation.target.getAttribute("aria-hidden")
      );
    }
  });
  observer.observe(document.getElementById("root"), { attributes: true });
  refs.disconnectObserver = () => observer.disconnect();
};

let teardownMutationObserver = ({ refs }) => {
  refs.disconnectObserver();
};

export let Example = () => (
  <Component
    refs={{ disconnectObserver: null }}
    didMount={setupMutationObserver}
    willUnmount={teardownMutationObserver}
    initialState={{ showDialog: false }}
  >
    {({ state, setState }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

        <Dialog
          isOpen={state.showDialog}
          onDismiss={() => setState({ showDialog: false })}
        >
          <p>
            The root node should have aria-hidden="true" set when opened and
            unset when closed.
          </p>
        </Dialog>
      </div>
    )}
  </Component>
);
