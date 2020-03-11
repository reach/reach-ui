import React from "react";
import { render, act, withMarkup, fireEvent } from "$test/utils";
import { axe } from "jest-axe";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";

describe("<MenuButton />", () => {
  it("should not have basic a11y issues", async () => {
    let { container } = render(<BasicMenuButton />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should toggle on button click", () => {
    let { getByRole, getByText, queryByText } = render(<BasicMenuButton />);
    let getByTextWithMarkup = withMarkup(getByText);
    let queryByTextWithMarkup = withMarkup(queryByText);

    // Menu opens on mousedown, not click!
    function clickButton() {
      fireEvent.mouseDown(getByRole("button"));
      fireEvent.mouseUp(getByRole("button"));
    }

    expect(queryByTextWithMarkup("Create a Copy")).not.toBeTruthy();
    act(clickButton);
    expect(getByTextWithMarkup("Create a Copy")).toBeInTheDocument();
  });
});

function BasicMenuButton() {
  return (
    <Menu>
      <MenuButton id="example-button">
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList>
        <input type="text" />
        <MenuItem onSelect={() => jest.fn()}>Download</MenuItem>
        <MenuItem onSelect={() => jest.fn()}>Create a Copy</MenuItem>
        <MenuItem onSelect={() => jest.fn()}>Mark as Draft</MenuItem>
        <MenuItem onSelect={() => jest.fn()}>Delete</MenuItem>
      </MenuList>
    </Menu>
  );
}
