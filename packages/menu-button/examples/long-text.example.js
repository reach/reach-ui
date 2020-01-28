import React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuList,
  MenuLink,
  MenuButton,
  MenuItem
} from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "Long Text";

function Example() {
  return (
    <>
      <Menu>
        <MenuButton>
          Developers Developers Developers Developers <span aria-hidden>▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
          <MenuLink href="https://reacttraining.com/workshops/">
            Attend a Workshop Attend a Workshop Attend a Workshop Attend a
            Workshop Attend a Workshop
          </MenuLink>
        </MenuList>
      </Menu>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Menu>
          <MenuButton>
            Developers Developers Developers Developers{" "}
            <span aria-hidden>▾</span>
          </MenuButton>
          <MenuList>
            <MenuItem onSelect={action("Download")}>Download</MenuItem>
            <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
            <MenuItem onSelect={action("Mark as Draft")}>
              Mark as Draft
            </MenuItem>
            <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
            <MenuLink href="https://reacttraining.com/workshops/">
              Attend a Workshop Attend a Workshop Attend a Workshop Attend a
              Workshop Attend a Workshop
            </MenuLink>
          </MenuList>
        </Menu>
      </div>
    </>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "MenuButton" };
