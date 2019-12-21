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

export let name = "With Styled Components";

export let Example = () => (
  <Menu>
    <StyledButton id="example-button">
      Actions <span aria-hidden="true">▾</span>
    </StyledButton>
    <StyledList>
      <StyledItem onSelect={action("Download")}>Download</StyledItem>
      <StyledItem onSelect={action("Copy")}>Create a Copy</StyledItem>
      <StyledItem onSelect={action("Mark as Draft")}>Mark as Draft</StyledItem>
      <StyledItem onSelect={action("Delete")}>Delete</StyledItem>
      <StyledLink href="https://google.com">Google</StyledLink>
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

const StyledItem = styled(MenuItem)`
  &[data-selected] {
    background: palevioletred;
  }
`;

const StyledLink = styled(MenuLink)`
  &[data-selected] {
    background: palevioletred;
  }
`;
