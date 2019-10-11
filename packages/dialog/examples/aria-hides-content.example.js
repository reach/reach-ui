import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Dialog } from "../src/index";

export const name = "Aria Hides Content";

const setupMutationObserver = ({ refs }) => {
  console.log("mutation observer");
  const logMutation = action("Root Node Attribute Mutated");
  const observer = new MutationObserver(mutationsList => {
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

const teardownMutationObserver = ({ refs }) => {
  refs.disconnectObserver();
};

export const Example = () => (
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
