import React from "react";
import Component from "@reach/component-component";
import { Menu, MenuButton, MenuList, MenuItem } from "../../menu-button";
import "../styles.css";
import { Dialog } from "../src/index";

export const name = "Dropdown";

export const Example = () => (
  <Component initialState={{ showDialog: false }}>
    {({ state, setState }) => (
      <div>
        <button onClick={() => setState({ showDialog: true })}>
          Show Dialog
        </button>

        <Dialog isOpen={state.showDialog}>
          <button onClick={() => setState({ showDialog: false })}>
            Close Dialog
          </button>
          <Menu>
            <MenuButton>Dropdown</MenuButton>
            <MenuList>
              <MenuItem>Test</MenuItem>
              <MenuItem>Test</MenuItem>
              <MenuItem>Test</MenuItem>
            </MenuList>
          </Menu>
        </Dialog>
      </div>
    )}
  </Component>
);
