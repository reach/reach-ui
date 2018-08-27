import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "Destroy Trigger";

export let Example = () => (
  <Component
    getRefs={() => ({
      openButton: React.createRef(),
      startOverButton: React.createRef()
    })}
    initialState={{ phase: 1 }}
  >
    {({ state, setState, refs }) => (
      <div>
        {state.phase === 1 ? (
          <button
            ref={refs.openButton}
            key={state.phase}
            onClick={() => setState({ phase: 2 })}
          >
            Show Dialog
          </button>
        ) : (
          <button
            ref={refs.startOverButton}
            key={state.phase}
            onClick={() =>
              setState({ phase: 1 }, () => refs.openButton.current.focus())
            }
          >
            Start over
          </button>
        )}

        <Dialog isOpen={state.phase === 2}>
          <button
            onClick={() =>
              setState({ phase: 3 }, () => refs.startOverButton.current.focus())
            }
          >
            Close Dialog
          </button>
          <p>What happens when the button goes away?!</p>
        </Dialog>
      </div>
    )}
  </Component>
);
