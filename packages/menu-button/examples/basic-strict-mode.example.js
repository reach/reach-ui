import React, { StrictMode } from "react";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import { action } from "@storybook/addon-actions";
import "@reach/menu-button/styles.css";

let name = "Basic (strict mode)";

function Example() {
  return (
    <StrictMode>
      <Menu>
        <MenuButton id="example-button">
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
    </StrictMode>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "MenuButton" };
