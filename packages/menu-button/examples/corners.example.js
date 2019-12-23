import React, { Fragment } from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import { createGlobalStyle } from "styled-components";
import "@reach/menu-button/styles.css";

const GlobalStyle = createGlobalStyle`
  html,
  body {
    margin: 0;
    padding: 0;
    height: 100%;
  }

  #root {
    position: relative;
    height: 100%;
  }
`;

export let name = "At the Corners";

export function Example() {
  return (
    <Fragment>
      <GlobalStyle />
      <MyMenuButton
        style={{ position: "absolute", top: 0, left: 0 }}
        id="button-1"
      />
      <MyMenuButton
        style={{ position: "absolute", top: 0, right: 0 }}
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
    </Fragment>
  );
}

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
