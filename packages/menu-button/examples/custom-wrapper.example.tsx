import React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuPopover,
  MenuItems,
  MenuButton,
  MenuItem
} from "@reach/menu-button";
import { positionMatchWidth } from "@reach/popover";
import "@reach/menu-button/styles.css";

export let name = "With Custom Wrapper";

export const Example: React.FC = () => {
  return (
    <Menu>
      <MenuButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuPopover position={positionMatchWidth}>
        <div>
          <MenuItems>
            <MenuItem onSelect={action("Download")}>Download</MenuItem>
            <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
            <MenuItem onSelect={action("Mark as Draft")}>
              Mark as Draft
            </MenuItem>
            <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
          </MenuItems>
        </div>
      </MenuPopover>
    </Menu>
  );
};
