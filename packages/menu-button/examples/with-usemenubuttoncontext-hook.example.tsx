import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  useMenuButtonContext,
} from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "With useMenuButtonContext (TS)";

function StyledMenuButton(
  props: React.ComponentPropsWithoutRef<typeof MenuButton>
) {
  const { isExpanded } = useMenuButtonContext();

  return (
    <MenuButton
      style={{
        ...(props.style || {}),
        border: "2px solid",
        borderColor: isExpanded ? "crimson" : "black",
      }}
      {...props}
    />
  );
}

function Example() {
  return (
    <Menu>
      <StyledMenuButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </StyledMenuButton>
      <MenuList>
        <MenuItem onSelect={action("Download")}>Download</MenuItem>
        <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
        <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
        <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}

Example.storyName = name;
export { Example };
