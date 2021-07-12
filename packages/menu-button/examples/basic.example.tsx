import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuLink,
} from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "Basic (TS)";

function Example() {
  return (
    <div>
      <Menu>
        <MenuButton id="actions-button">
          Actions{" "}
          <span aria-hidden="true" style={{ userSelect: "none" }}>
            ▾
          </span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
      <Menu>
        <MenuButton id="links-button">
          Links{" "}
          <span aria-hidden="true" style={{ userSelect: "none" }}>
            ▾
          </span>
        </MenuButton>
        <MenuList>
          <MenuLink href="https://google.com">Google</MenuLink>
          <MenuLink href="https://duckduckgo.com">Duck Duck Go</MenuLink>
        </MenuList>
      </Menu>
    </div>
  );
}

Example.storyName = name;
export { Example };
