import React from "react";
import Component from "@reach/component-component";
import "@reach/dialog/styles.css";
import {
  AlertDialog,
  AlertDialogLabel,
  AlertDialogDescription
} from "../src/index";

export let name = "Basic";

export let Example = () => (
  <Component
    getRefs={() => ({ close: React.createRef() })}
    initialState={{ showDialog: false }}
  >
    {({ state, setState, refs }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

        {state.showDialog && (
          <AlertDialog leastDestructiveRef={refs.close}>
            <AlertDialogLabel>Confirmation!</AlertDialogLabel>
            <AlertDialogDescription>
              Are you sure you want to have that milkshake?
            </AlertDialogDescription>
            <p>
              <button>DESTROY Stuff!</button>{" "}
              <button
                ref={refs.close}
                onClick={() => setState({ showDialog: false })}
              >
                Cancel
              </button>
            </p>
          </AlertDialog>
        )}
      </div>
    )}
  </Component>
);
