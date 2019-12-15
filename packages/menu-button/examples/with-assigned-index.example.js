import "@reach/menu-button/styles.css";

import React from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";

export let name = "With Assigned Indices";

export let Example = () => {
  const [activeItem, setActiveItem] = React.useState(false);
  const items = [
    {
      label: "Download",
      onSelect: action("Download")
    },
    activeItem
      ? {
          label: "Create a Copy",
          onSelect: action("Copy")
        }
      : null,
    {
      label: "Mark as Draft",
      onSelect: action("Draft")
    },
    {
      label: "Delete",
      onSelect: action("Delete")
    }
  ].filter(Boolean);
  return (
    <>
      <Menu>
        <MenuButton id="example-button">
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          {items.map((item, index) => (
            <MenuItem index={index} onSelect={item.onSelect}>
              {item.label}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <button onClick={() => void setActiveItem(!activeItem)}>
        Toggle Copy Option
      </button>
    </>
  );
};
