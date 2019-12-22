import React from "react";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/menu-button/styles.css";

export default function Basic() {
  return (
    <Menu>
      <MenuButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList>
        <MenuItem onSelect={() => console.log("Download")}>Download</MenuItem>
        <MenuItem onSelect={() => console.log("Copy")}>Create a Copy</MenuItem>
        <MenuItem onSelect={() => console.log("Mark as Draft")}>
          Mark as Draft
        </MenuItem>
        <MenuItem onSelect={() => console.log("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}
