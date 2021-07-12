import * as React from "react";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import { action } from "@storybook/addon-actions";
import "@reach/menu-button/styles.css";

let name = "With Disabled Items";

function Example() {
  let [disabled, setDisabled] = React.useState(true);
  return (
    <div>
      <Menu>
        <MenuButton id="example-button">
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          <MenuItem onSelect={action("Download")} disabled={disabled}>
            Download
          </MenuItem>
          <MenuItem onSelect={action("Copy")}>Copy</MenuItem>
          <MenuItem onSelect={action("Create")}>Create</MenuItem>
          <MenuItem onSelect={action("Mark as Draft")} disabled>
            Mark as Draft
          </MenuItem>
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
      <button onClick={() => setDisabled(!disabled)}>
        {disabled ? "Enable" : "Disable"} the first item
      </button>
    </div>
  );
}

Example.storyName = name;
export { Example };
