import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuLink,
  MenuButton,
  MenuPopover,
  MenuItems,
  MenuItem,
} from "@reach/menu-button";
import styled from "styled-components";
import "@reach/menu-button/styles.css";

let name = "With Styled Components";

function Example() {
  return (
    <Menu>
      <StyledButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </StyledButton>
      <StyledPopover>
        <StyledItems>
          <StyledItem onSelect={action("Download")}>Download</StyledItem>
          <StyledItem onSelect={action("Copy")}>Create a Copy</StyledItem>
          <StyledItem onSelect={action("Mark as Draft")}>
            Mark as Draft
          </StyledItem>
          <StyledItem onSelect={action("Delete")}>Delete</StyledItem>
          <StyledLink href="https://google.com">Google</StyledLink>
        </StyledItems>
      </StyledPopover>
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

const StyledPopover = styled(MenuPopover)`
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.2);
`;

const StyledItems = styled(MenuItems)`
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
