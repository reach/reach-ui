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

let name = "With Disabled Links";

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

Example.storyName = name;
export { Example };

let memoryHistory = createHistory(createMemorySource("/"));

function Home() {
  let [disabled, setDisabled] = React.useState(true);
  return (
    <div>
      <Menu>
        <MenuButton>
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          <MenuLink as={Link} to="/settings" disabled={disabled}>
            View Settings
          </MenuLink>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
      <button onClick={() => setDisabled(!disabled)}>
        {disabled ? "Enable" : "Disable"} the link
      </button>
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
