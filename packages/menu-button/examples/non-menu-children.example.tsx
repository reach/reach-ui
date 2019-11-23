import "@reach/menu-button/styles.css";

import React from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";

export let name = "Non Menu Children (TSX)";

const ExampleLabel = (props: any) => (
  <span
    style={{
      padding: "0 20px",
      margin: "10px 0",
      fontWeight: "bold",
      color: "orangered",
      textTransform: "uppercase",
      fontSize: "11px",
      display: "block"
    }}
    {...props}
  />
);

export let Example = () => (
  <Menu>
    <MenuButton>
      Actions <span aria-hidden="true">▾</span>
    </MenuButton>
    <MenuList>
      <ExampleLabel>Mammals</ExampleLabel>
      <MenuItem onSelect={action("Bear")}>Bear</MenuItem>
      <MenuItem onSelect={action("Fox")}>Fox</MenuItem>
      <MenuItem onSelect={action("Lion")}>Lion</MenuItem>
      <ExampleLabel>Reptiles</ExampleLabel>
      <MenuItem onSelect={action("Lizard")}>Lizard</MenuItem>
      <MenuItem onSelect={action("Snake")}>Snake</MenuItem>
      <MenuItem onSelect={action("Crocodile")}>Crocodile</MenuItem>
      <ExampleLabel>Amphibians</ExampleLabel>
      <MenuItem onSelect={action("Frog")}>Frog</MenuItem>
      <MenuItem onSelect={action("Toad")}>Toad</MenuItem>
      <MenuItem onSelect={action("Salamander")}>Salamander</MenuItem>
    </MenuList>
  </Menu>
);
