import "@reach/menu-button/styles.css";

import React, { useState } from "react";
import { action } from "@storybook/addon-actions";
import {
  MenuProvider,
  MenuButton,
  MenuPopover,
  Menu,
  MenuItem
} from "../src/index";

export let name = "Conditional Items";

export let Example = () => {
  const [activeItem, setActiveItem] = useState(false);
  return (
    <>
      <MenuProvider>
        <MenuButton>
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuPopover>
          <Menu>
            <MenuItem onSelect={action("Download")}>Download</MenuItem>
            {activeItem && (
              <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
            )}
            <MenuItem onSelect={action("Mark as Draft")}>
              Mark as Draft
            </MenuItem>
            <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
          </Menu>
        </MenuPopover>
      </MenuProvider>
      <button onClick={() => setActiveItem(!activeItem)}>
        Toggle Copy Option
      </button>
    </>
  );
};
