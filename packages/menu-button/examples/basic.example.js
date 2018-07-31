import React from "react";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Menu, MenuItems, MenuButton, MenuItem } from "../src/index";

export let name = "Basic";

export let Example = () => (
  <Menu>
    <MenuButton>
      Actions <span aria-hidden="true">▾</span>
    </MenuButton>
    <MenuItems>
      <MenuItem onSelect={action("Download")}>Download</MenuItem>
      <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
      <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
      <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
    </MenuItems>
  </Menu>
);
