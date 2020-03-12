import React from "react";
import { render, act, fireEvent } from "$test/utils";
import { axe } from "jest-axe";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";

describe("<MenuButton />", () => {
  it("should not have basic a11y issues", async () => {
    let { container } = render(<BasicMenuButton />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should toggle on button click", () => {
    let { getByRole, baseElement } = render(<BasicMenuButton />);

    let getPopover = () =>
      baseElement.querySelector("[data-reach-menu-popover]");

    // Menu opens on mousedown, not click!
    function clickButton() {
      fireEvent.mouseDown(getByRole("button"));
      fireEvent.mouseUp(getByRole("button"));
    }

    expect(getPopover()).not.toBeVisible();
    act(() => void clickButton());
    expect(getPopover()).toBeVisible();
    act(() => void clickButton());
    expect(getPopover()).not.toBeVisible();
  });
});

function BasicMenuButton() {
  return (
    <Menu>
      <MenuButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList>
        <MenuItem onSelect={() => jest.fn()}>Download</MenuItem>
        <MenuItem onSelect={() => jest.fn()}>Create a Copy</MenuItem>
        <MenuItem onSelect={() => jest.fn()}>Mark as Draft</MenuItem>
        <MenuItem onSelect={() => jest.fn()}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}
