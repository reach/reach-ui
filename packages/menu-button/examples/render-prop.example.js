import * as React from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "Render Prop";

function Example() {
  return (
    <Menu>
      {({ isExpanded }) => (
        <React.Fragment>
          <MenuButton>
            {isExpanded ? "Close" : "Open"} <span aria-hidden="true">▾</span>
          </MenuButton>
          <MenuList>
            <MenuItem onSelect={action("Download")}>Download</MenuItem>
            <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
            <MenuItem onSelect={action("Mark as Draft")}>
              Mark as Draft
            </MenuItem>
            <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
          </MenuList>
        </React.Fragment>
      )}
    </Menu>
  );
}

Example.storyName = name;
export { Example };
