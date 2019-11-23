import "@reach/menu-button/styles.css";

import React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuList,
  MenuLink,
  MenuButton,
  MenuItem
} from "@reach/menu-button";
import styled from "styled-components";

export let name = "With Styled Components (TS)";

/**
 * Because we check a component's type to determine whether or not it should be
 * focusable, MenuItem and MenuLink components cannot be wrapped or subbed for
 * styled compoments. While we work on updating our implementation, you can use
 * the `as` prop to support styled components in your MenuButton today!
 */

export let Example = () => (
  <Menu>
    <StyledButton id="example-button">
      Actions <span aria-hidden="true">▾</span>
    </StyledButton>
    <StyledList>
      <MenuItem as={StyledItem} onSelect={action("Download")}>
        Download
      </MenuItem>
      <MenuItem as={StyledItem} onSelect={action("Copy")}>
        Create a Copy
      </MenuItem>
      <MenuItem as={StyledItem} onSelect={action("Mark as Draft")}>
        Mark as Draft
      </MenuItem>
      <MenuItem as={StyledItem} onSelect={action("Delete")}>
        Delete
      </MenuItem>
      <MenuLink as={StyledLink} href="https://google.com">
        Google
      </MenuLink>
    </StyledList>
  </Menu>
);

const StyledButton = styled(MenuButton)`
  background: 0;
  border: 3px solid currentColor;
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
  box-shadow: none;
`;

const StyledList = styled(MenuList)`
  border: 3px solid currentColor;
  margin-top: 2px;
  padding: 0.5rem;
  color: palevioletred;
`;

// Use a div for your styled MenuItem and a tags for your styled MenuLink
const StyledItem = styled.div`
  &[data-selected] {
    background: palevioletred;
  }
`;

const StyledLink = styled.a`
  &[data-selected] {
    background: palevioletred;
  }
`;
