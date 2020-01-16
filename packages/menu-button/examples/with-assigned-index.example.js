import React, { useState } from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import PeteOlder from "./pete-older.png";
import PeteYounger from "./pete-younger.png";
import "@reach/menu-button/styles.css";

export let name = "With Assigned Indices";

/*
 * An experiment to see whether or not there may be a case for menu items with
 * duplicate valueText. A user would need to provide a specific index prop for
 * this to work. I could see a case for something like this in a user selection
 * type menu where perhaps multiple users have the same name. This is probably
 * confusing and should be avoided in general, but it probably makes sense for
 * this to work in the rare cases this might occur.
 */

export function Example() {
  const [activeItem, setActiveItem] = useState(false);
  const items = [
    {
      label: "Pete",
      img: PeteYounger,
      onSelect: action("Younger Pete")
    },
    {
      label: "Pete",
      img: PeteOlder,
      onSelect: action("Older Pete")
    },
    activeItem
      ? {
          label: "Go Home",
          onSelect: action("Home")
        }
      : null
  ].filter(Boolean);
  return (
    <>
      <Menu>
        <MenuButton id="example-button">
          Go to User Profile <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          {items.map((item, index) => (
            <MenuItem index={index} onSelect={item.onSelect}>
              <span style={{ display: "flex", alignItems: "center" }}>
                {item.img && (
                  <span
                    style={{
                      marginRight: 8,
                      display: "block",
                      overflow: "hidden",
                      width: 36,
                      height: 36,
                      borderRadius: 18
                    }}
                  >
                    <img
                      src={`${item.img}`}
                      alt={item.label}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </span>
                )}
                <span style={{ display: "block" }}>{item.label}</span>
              </span>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <button onClick={() => void setActiveItem(!activeItem)}>
        Toggle "Home" Option
      </button>
    </>
  );
}
