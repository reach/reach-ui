/* eslint-disable jsx-a11y/accessible-emoji */

import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  DropdownProvider,
  DropdownItem,
  DropdownItems,
  DropdownPopover,
  DropdownTrigger,
} from "@reach/dropdown";
import Tooltip from "@reach/tooltip";
import "@reach/dropdown/styles.css";
import "@reach/tooltip/styles.css";

let name = "With Tooltip";

function Example() {
  return (
    <DropdownProvider>
      <Tooltip label="Hamburger">
        <DropdownTrigger>
          <span>🍔</span>
        </DropdownTrigger>
      </Tooltip>
      <DropdownPopover>
        <DropdownItems>
          <DropdownItem onSelect={action("Download")}>Download</DropdownItem>
          <DropdownItem onSelect={action("Copy")}>Create a Copy</DropdownItem>
          <DropdownItem onSelect={action("Mark as Draft")}>
            Mark as Draft
          </DropdownItem>
          <DropdownItem onSelect={action("Delete")}>Delete</DropdownItem>
        </DropdownItems>
      </DropdownPopover>
    </DropdownProvider>
  );
}

Example.storyName = name;
export { Example };
