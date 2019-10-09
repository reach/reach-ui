import React from "react";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuLink, MenuButton, MenuItem } from "../src/index";

export let name = "Long Text";

export let Example = () => (
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
        <MenuLink href="https://reach.tech/workshops">
          Attend a Workshop Attend a Workshop Attend a Workshop Attend a
          Workshop Attend a Workshop
        </MenuLink>
      </MenuList>
    </Menu>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <Menu>
        <MenuButton>
          Developers Developers Developers Developers <span aria-hidden>▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
          <MenuLink href="https://reach.tech/workshops">
            Attend a Workshop Attend a Workshop Attend a Workshop Attend a
            Workshop Attend a Workshop
          </MenuLink>
        </MenuList>
      </Menu>
    </div>
  </>
);
