import React from "react";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "../src/index";

export let name = "Render Callback";

export let Example = () => (
  <Menu>
    {({ isOpen }) => (
      <React.Fragment>
        <MenuButton>
          {isOpen ? "Close" : "Open"} <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </React.Fragment>
    )}
  </Menu>
);
