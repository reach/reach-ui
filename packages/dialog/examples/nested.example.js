import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Nested";

export let Example = () => (
  <Component initialState={{ showDialog: false }}>
    {({ state, setState }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>
        <Dialog
          onDismiss={() => setState({ showDialog: false })}
          isOpen={state.showDialog}
        >
          <Component initialState={{ showDialog: false }}>
            {({ state, setState }) => (
              <div>
                <button onClick={() => setState({ showDialog: true })}>
                  Show Another Dialog
                </button>
                <p>You can never have too many design escape hatches</p>

                <Dialog
                  style={{ position: "relative", left: 20, top: 20 }}
                  onDismiss={() => setState({ showDialog: false })}
                  isOpen={state.showDialog}
                >
                  <button onClick={() => setState({ showDialog: false })}>
                    Close Dialog
                  </button>
                  <p>Well, maybe you can</p>
                </Dialog>
              </div>
            )}
          </Component>
        </Dialog>
      </div>
    )}
  </Component>
);
