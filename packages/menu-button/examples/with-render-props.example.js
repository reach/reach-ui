import * as React from "react";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import { action } from "@storybook/addon-actions";
import "@reach/menu-button/styles.css";

let name = "With Render Props";

function Example() {
  return (
    <Menu>
      {() => (
        <React.Fragment>
          <MenuButton id="example-button">
            Actions <span aria-hidden="true">▾</span>
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
