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
          <Menu
            // Because of how the focus lock works with @reach/dialog, portaled
            // nodes, such as the element rendered by the menu button popover,
            // cannot receive focus without the focus lock immediately stealing
            // it back and closing the menu. To use the menu inside a dialog,
            // set the `portal` prop to false.
            //
            // This may impact styling since the popover is absolutely
            // positioned, so the easiest solution is for the entire menu button
            // and popover to be rendered in a shared, relative-positioned
            // container. By default `Menu` does not render a DOM node, so you
            // can either pass an element to its `as` prop or wrap it in your
            // own container.
            as="span"
            style={{ display: "inline-block", position: "relative" }}
          >
            <MenuButton>Actions 1</MenuButton>
            <MenuList portal={false}>
              <MenuItem onSelect={action("Download")}>Download</MenuItem>
              <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
              <MenuItem onSelect={action("Mark as Draft")}>
                Mark as Draft
              </MenuItem>
            </MenuList>
          </Menu>
          <Menu
            as="span"
            style={{ display: "inline-block", position: "relative" }}
          >
            <MenuButton>Actions 2</MenuButton>
            <MenuList portal={false}>
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
