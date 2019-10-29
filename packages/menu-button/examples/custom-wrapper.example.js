import "@reach/menu-button/styles.css";

import React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuListContainer,
  MenuListInner,
  MenuButton,
  MenuItem
} from "@reach/menu-button";

export let name = "With Custom Wrapper";

export let Example = () => (
  <Menu>
    <MenuButton id="example-button">
      Actions <span aria-hidden="true">▾</span>
    </MenuButton>
    <MenuListContainer>
      <div>
        <MenuListInner>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuListInner>
      </div>
    </MenuListContainer>
  </Menu>
);
