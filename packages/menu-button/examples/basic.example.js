import "@reach/menu-button/styles.css";
import React from "react";
import {
  MenuProvider,
  MenuButton,
  MenuPopover,
  Menu,
  MenuItem
} from "../src/index";

export let name = "Basic";

export let Example = () => (
  <div>
    <MenuProvider>
      <MenuButton>
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuPopover>
        <Menu>
          <MenuItem onSelect={() => console.log("download")}>Download</MenuItem>
          <MenuItem onSelect={() => console.log("delete")}>Delete</MenuItem>
          <hr />
          <MenuItem onSelect={() => console.log("view settings")}>
            View Account Settings
          </MenuItem>
          <MenuItem onSelect={() => console.log("profile")}>
            Update Profile
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuProvider>
  </div>
);
