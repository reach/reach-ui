import React from "react";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import { action } from "@storybook/addon-actions";
import "@reach/menu-button/styles.css";

let name = "With Disabled Items";

function Example() {
  return (
    <Menu>
      <MenuButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList>
        <MenuItem onSelect={action("Download")} disabled>
          Download
        </MenuItem>
        <MenuItem onSelect={action("Copy")}>Copy</MenuItem>
        <MenuItem onSelect={action("Create")}>Create</MenuItem>
        <MenuItem onSelect={action("Mark as Draft")} disabled>
          Mark as Draft
        </MenuItem>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "MenuButton" };
