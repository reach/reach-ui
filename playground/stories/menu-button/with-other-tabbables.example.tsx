import * as React from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "With Other Tabbables";

function Example() {
  return (
    <div>
      <p>
        <label htmlFor="cheers">How many cheers for Reach?</label>
        <select id="cheers">
          <option>one</option>
          <option>two</option>
          <option>three</option>
        </select>
      </p>
      <Menu>
        <MenuButton>
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
      <button type="button">I do nothing</button>
    </div>
  );
}

Example.storyName = name;
export { Example };
