import * as React from "react";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import { positionRight } from "@reach/popover";
import { action } from "@storybook/addon-actions";
import "@reach/menu-button/styles.css";

let name = "MenuList with position prop";

function Example() {
  return (
    <div>
      <Menu>
        <MenuButton id="actions-button">
          Actions{" "}
          <span aria-hidden="true" style={{ userSelect: "none" }}>
            ▾
          </span>
        </MenuButton>
        <MenuList position={positionRight}>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
}

Example.storyName = name;
export const Basic = Example;
export default { title: "MenuButton" };
