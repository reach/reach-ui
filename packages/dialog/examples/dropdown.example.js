import React from "react";
import { Menu, MenuButton, MenuList, MenuItem } from "@reach/menu-button";
import "../styles.css";
import { Dialog } from "@reach/dialog";

export let name = "Dropdown";

export let Example = () => {
  const [showDialog, setShowDialog] = React.useState(false);
  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <Dialog isOpen={showDialog}>
        <button onClick={() => setShowDialog(false)}>Close Dialog</button>
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
  );
};
