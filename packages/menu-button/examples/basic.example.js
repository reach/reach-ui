import "@reach/menu-button/styles.css";
import React from "react";
import {
  MenuProvider,
  MenuButton,
  MenuPopover,
  Menu,
  MenuItem
} from "../src/index";

export let name = "Basic";

export let Example = () => (
  <div>
    <MenuProvider>
      <MenuButton>
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuPopover>
        <Menu>
          <MenuItem onSelect={() => console.log("beef")}>Beef</MenuItem>
          <MenuItem onSelect={() => console.log("cheese")}>Cheese</MenuItem>
          <MenuItem onSelect={() => console.log("beef")}>Beef</MenuItem>
          <hr />
          <MenuItem onSelect={() => console.log("cheese")}>Cheese</MenuItem>
          <MenuItem onSelect={() => console.log("beef")}>Beef</MenuItem>
          <MenuItem onSelect={() => console.log("cheese")}>Cheese</MenuItem>
          <MenuItem onSelect={() => console.log("beef")}>Beef</MenuItem>
          <hr />
          <MenuItem onSelect={() => console.log("cheese")}>Cheese</MenuItem>
          <MenuItem onSelect={() => console.log("beef")}>Beef</MenuItem>
          <MenuItem onSelect={() => console.log("cheese")}>Cheese</MenuItem>
          <MenuItem onSelect={() => console.log("beef")}>Beef</MenuItem>
          <MenuItem onSelect={() => console.log("cheese")}>Cheese</MenuItem>
          <MenuItem onSelect={() => console.log("beef")}>Beef</MenuItem>
          <MenuItem onSelect={() => console.log("cheese")}>Cheese</MenuItem>
        </Menu>
      </MenuPopover>
    </MenuProvider>
  </div>
);
