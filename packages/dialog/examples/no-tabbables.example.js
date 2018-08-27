import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Dialog } from "../src/index";

export let name = "No Tabbables";

export let Example = () => (
  <Component initialState={{ showDialog: false }}>
    {({ state, setState }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

        <Dialog
          isOpen={state.showDialog}
          onDismiss={() => setState({ showDialog: false })}
          onFocus={action("Focused!")}
        >
          <h2>There are no tabbables here</h2>
          <p>It should focus the element itself</p>
        </Dialog>
      </div>
    )}
  </Component>
);
