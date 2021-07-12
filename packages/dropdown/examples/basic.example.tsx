import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
  DropdownProvider,
  DropdownItem,
  DropdownItems,
  DropdownPopover,
  DropdownTrigger,
} from "@reach/dropdown";
import "@reach/dropdown/styles.css";

let name = "Basic";

function Example() {
  return (
    <div>
      <DropdownProvider>
        <DropdownTrigger id="actions-button">
          Actions{" "}
          <span aria-hidden="true" style={{ userSelect: "none" }}>
            ▾
          </span>
        </DropdownTrigger>
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
    </div>
  );
}

Example.storyName = name;
export { Example };
