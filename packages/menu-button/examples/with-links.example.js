import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuLink,
  MenuItem,
} from "@reach/menu-button";
import {
  Router,
  Link,
  createMemorySource,
  createHistory,
  LocationProvider,
} from "@reach/router";
import "@reach/menu-button/styles.css";

let name = "With Links";

function Example() {
  return (
    <LocationProvider history={memoryHistory}>
      <Router>
        <Home path="/" />
        <Settings path="/settings" />
      </Router>
    </LocationProvider>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "MenuButton" };

////////////////////////////////////////////////////////////////////////////////

// this is because we're in an iframe and not a
// pushState server inside of storybook
let memoryHistory = createHistory(createMemorySource("/"));

function Home() {
  return (
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
}

function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <p>
        <Link to="/">Go Home</Link>
      </p>
    </div>
  );
}
