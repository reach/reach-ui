import * as React from "react";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import { action } from "@storybook/addon-actions";
import "@reach/menu-button/styles.css";
import "./animate.css";

let name = "Animated";

function Example() {
  return (
    <Menu>
      <MenuButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList className="slide-down">
        <MenuItem onSelect={action("Download")}>Download</MenuItem>
        <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
        <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}

Example.storyName = name;
export { Example };
