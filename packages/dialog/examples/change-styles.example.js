import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { DialogOverlay, DialogContent } from "../src/index";
import {
  Transition,
  animated,
  config
} from "../../../www/vendor/react-spring/src/targets/web";

console.log(config);

export let name = "Change Styles";

let AnimatedDialogOverlay = animated(DialogOverlay);
let AnimatedDialogContent = animated(DialogContent);

export let Example = () => (
  <Component initialState={{ showDialog: false }}>
    {({ state, setState }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

        <Transition
          native
          config={config.stiff}
          from={{ opacity: 0, y: -10 }}
          enter={{ opacity: 1, y: 0 }}
          leave={{ opacity: 0, y: 10 }}
        >
          {state.showDialog &&
            (styles => (
              <AnimatedDialogOverlay style={{ opacity: styles.opacity }}>
                <AnimatedDialogContent
                  style={{
                    transform: `translate3d(0px, ${styles.y}px, 0px)`,
                    border: "4px solid hsla(0, 0%, 0%, 0.5)",
                    borderRadius: 10
                  }}
                >
                  <button onClick={() => setState({ showDialog: false })}>
                    Close Dialog
                  </button>
                  <p>React Spring makes it too easy!</p>
                  <input type="text" />
                  <br />
                  <input type="text" />
                  <button>Ayyyyyy</button>
                </AnimatedDialogContent>
              </AnimatedDialogOverlay>
            ))}
        </Transition>
      </div>
    )}
  </Component>
);
