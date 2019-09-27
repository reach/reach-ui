import React from "react";
import Component from "@reach/component-component";
import "../styles.css";
import { Dialog } from "../src/index";

export let name = "With Body Scroll";

export let Example = () => (
  <Component initialState={{ showDialog: false, removeScroll: true }}>
    {({ state, setState }) => (
      <div>
        <button
          onClick={() => setState({ showDialog: true, removeScroll: true })}
        >
          Show Dialog Without Scroll
        </button>
        <button
          onClick={() => setState({ showDialog: true, removeScroll: false })}
        >
          Show Dialog Whith Scroll
        </button>

        {new Array(20).fill(1).map((x, index) => (
          <div style={{ position: "absolute", top: (index + 1) * 100 + "px" }}>
            - scroll -
          </div>
        ))}

        <Dialog isOpen={state.showDialog} removeScroll={state.removeScroll}>
          <button onClick={() => setState({ showDialog: false })}>
            Close Dialog
          </button>
          <p>Yikes!</p>
        </Dialog>
      </div>
    )}
  </Component>
);
