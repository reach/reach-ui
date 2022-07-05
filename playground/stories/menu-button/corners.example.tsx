import * as React from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "At the Corners";

function Example() {
  return (
    <React.Fragment>
      <div
        style={{
          position: "relative",
          height: "calc(100vh - 50px)",
          width: "calc(100vw - 50px)",
        }}
      >
        <MyMenuButton
          style={{ position: "absolute", top: 50, left: 0 }}
          id="button-1"
        />
        <MyMenuButton
          style={{ position: "absolute", top: 50, right: 0 }}
          id="button-2"
        />
        <MyMenuButton
          style={{ position: "absolute", bottom: 0, left: 0 }}
          id="button-3"
        />
        <MyMenuButton
          style={{ position: "absolute", bottom: 0, right: 0 }}
          id="button-4"
        />
      </div>
    </React.Fragment>
  );
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

function MyMenuButton({ ...props }) {
  return (
    <Menu>
      <MenuButton {...props}>
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList>
        <MenuItem onSelect={action("Download")}>Download</MenuItem>
        <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
        <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}
