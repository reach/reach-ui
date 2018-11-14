import React from "react";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "../src/index";

export let name = "Position";

export let Example = () => (
  <div style={{ marginLeft: 100 }}>
    <Menu>
      <MenuButton>
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList setPosition={centered}>
        <MenuItem onSelect={action("Download")}>Download</MenuItem>
        <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
        <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  </div>
);

let centered = (styles, { buttonRect, menuRect }) => {
  return {
    ...styles,
    left: styles.left - buttonRect.width / 2
  };
};
