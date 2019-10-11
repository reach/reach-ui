import React from "react";
import "../styles.css";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuLink, MenuItem } from "../src/index";
import {
  Router,
  Link,
  createMemorySource,
  createHistory,
  LocationProvider
} from "@reach/router";

export const name = "With Links";

const Home = () => (
  <div>
    <h2>Home</h2>
    <Menu>
      <MenuButton>
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList>
        <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
        <MenuLink as={Link} to="/settings">
          View Settings
        </MenuLink>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  </div>
);

const Settings = () => (
  <div>
    <h2>Settings</h2>
    <p>
      <Link to="/">Go Home</Link>
    </p>
  </div>
);

// this is because we're in an iframe and not a
// pushState server inside of storybook
const memoryHistory = createHistory(createMemorySource("/"));

export const Example = () => (
  <LocationProvider history={memoryHistory}>
    <Router>
      <Home path="/" />
      <Settings path="/settings" />
    </Router>
  </LocationProvider>
);
