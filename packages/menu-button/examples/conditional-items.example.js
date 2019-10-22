import "@reach/menu-button/styles.css";

import React, { useState } from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";

export let name = "Conditional Items";

export let Example = () => {
  const [activeItem, setActiveItem] = useState(false);
  return (
    <>
      <Menu>
        <MenuButton>
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          {activeItem && (
            <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          )}
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
      <button onClick={() => void setActiveItem(!activeItem)}>
        Toggle Copy Option
      </button>
    </>
  );
};
