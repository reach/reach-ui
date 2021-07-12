import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuList,
  MenuLink,
  MenuButton,
  MenuItem,
} from "@reach/menu-button";
import styled from "styled-components";
import "@reach/menu-button/styles.css";

let name = "With Styled Components (TS)";

function Example() {
  return (
    <Menu>
      <StyledButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </StyledButton>
      <StyledList>
        <StyledItem onSelect={action("Download")}>Download</StyledItem>
        <StyledItem onSelect={action("Copy")}>Create a Copy</StyledItem>
        <StyledItem onSelect={action("Mark as Draft")}>
          Mark as Draft
        </StyledItem>
        <MenuItem as={StyledItemAs} onSelect={action("Delete")}>
          Delete
        </MenuItem>
        <StyledLink href="https://google.com">Google</StyledLink>
        <MenuLink as={StyledLinkAs} href="https://duckduckgo.com">
          DuckDuckGo
        </MenuLink>
      </StyledList>
    </Menu>
  );
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

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

const StyledItemAs = styled.div`
  &[data-selected] {
    background: palevioletred;
  }
`;

const StyledLinkAs = styled.a`
  &[data-selected] {
    background: palevioletred;
  }
`;
