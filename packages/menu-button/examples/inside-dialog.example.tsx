import * as React from "react";
import { action } from "@storybook/addon-actions";
import { DialogOverlay, DialogContent } from "@reach/dialog";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/dialog/styles.css";
import "@reach/menu-button/styles.css";

let name = "Inside Dialog (TS)";

function Example() {
  let [showDialog, setShowDialog] = React.useState(false);

  return (
    <div>
      <button onClick={() => setShowDialog(true)}>Show Dialog</button>
      <DialogOverlay isOpen={showDialog} onDismiss={() => setShowDialog(false)}>
        <DialogContent
          aria-label="Some actions"
          style={{
            border: "solid 5px hsla(0, 0%, 0%, 0.5)",
            borderRadius: "10px",
          }}
        >
          <p>You can open me only after second click</p>
          <Menu>
            <MenuButton>Actions</MenuButton>
            <MenuList>
              <MenuItem onSelect={action("Download")}>Download</MenuItem>
              <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
              <MenuItem onSelect={action("Mark as Draft")}>
                Mark as Draft
              </MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton>Actions</MenuButton>
            <MenuList>
              <MenuItem onSelect={action("Download")}>Download</MenuItem>
              <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
              <MenuItem onSelect={action("Mark as Draft")}>
                Mark as Draft
              </MenuItem>
            </MenuList>
          </Menu>
        </DialogContent>
      </DialogOverlay>
    </div>
  );
}

Example.storyName = name;
export { Example };
