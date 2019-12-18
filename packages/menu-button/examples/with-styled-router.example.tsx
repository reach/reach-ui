import "@reach/menu-button/styles.css";

import React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuLink,
  MenuItem
} from "@reach/menu-button";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import styled from "styled-components";

export let name = "With React Router Links + Styled Components";

/*
 * When combining StyledComponents with a Router's Link component, users will
 * need to use `MenuLink` directly and pass a styled(Link) into the `as` prop.
 * This is because styled components also has an `as` prop, so using
 * `<StyledLink as={Link}>` is seen as an escape hatch by SC, so
 * `styled(MenuLink)` disregards the MenuLink argument.
 */

const Home = () => {
  console.log({ StyledLink });
  return (
    <div>
      <h2>Home</h2>
      <Menu>
        <MenuButton>
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          <StyledItem onSelect={action("Mark as Draft")}>
            Mark as Draft
          </StyledItem>
          <MenuLink as={StyledLink} to="/settings">
            View Settings
          </MenuLink>
          <StyledItem onSelect={action("Delete")}>Delete</StyledItem>
        </MenuList>
      </Menu>
    </div>
  );
};

const Settings = () => (
  <div>
    <h2>Settings</h2>
    <p>
      <Link to="/">Go Home</Link>
    </p>
  </div>
);

export let Example = () => (
  <Router>
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route path="/settings">
        <Settings />
      </Route>
      <Route>
        <Home />
      </Route>
    </Switch>
  </Router>
);

const StyledItem = styled(MenuItem)`
  &[data-selected] {
    background: crimson;
  }
`;

const StyledLink = styled(Link)`
  &[data-selected] {
    background: crimson;
  }
`;
