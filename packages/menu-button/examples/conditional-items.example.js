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
            <MenuItem onSelect={action("Beef")}>Beef</MenuItem>
            {activeItem && (
              <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
            )}
          </Menu>
        </MenuPopover>
      </MenuProvider>
      <button onClick={() => setActiveItem(!activeItem)}>
        Toggle Copy Option
      </button>
    </>
  );
};
