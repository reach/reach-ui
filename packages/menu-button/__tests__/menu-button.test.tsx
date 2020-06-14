import React, { Fragment } from "react";
import { render, act, fireEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";

describe("<MenuButton />", () => {
  describe("rendering", () => {
    it("should mount the component", () => {
      let { queryByRole } = render(
        <Menu>
          <MenuButton>Actions</MenuButton>
          <MenuList>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
            <MenuItem onSelect={jest.fn}>Create a Copy</MenuItem>
          </MenuList>
        </Menu>
      );
      expect(queryByRole("button")).toBeTruthy();
    });

    it("should mount with render props", () => {
      let { queryByRole } = render(
        <Menu>
          {(props) => (
            <Fragment>
              <MenuButton>
                {props.isExpanded ? "Close" : "Open"} Actions
              </MenuButton>
              <MenuList>
                <MenuItem onSelect={jest.fn}>Download</MenuItem>
                <MenuItem onSelect={jest.fn}>Create a Copy</MenuItem>
              </MenuList>
            </Fragment>
          )}
        </Menu>
      );
      expect(queryByRole("button")).toBeTruthy();
    });
  });

  describe("a11y", () => {
    it("should not have basic a11y issues", async () => {
      let { container } = render(
        <Menu>
          <MenuButton id="example-button">
            Actions <span aria-hidden="true">▾</span>
          </MenuButton>
          <MenuList>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
            <MenuItem onSelect={jest.fn}>Create a Copy</MenuItem>
            <MenuItem onSelect={jest.fn}>Mark as Draft</MenuItem>
            <MenuItem onSelect={jest.fn}>Delete</MenuItem>
          </MenuList>
        </Menu>
      );
      let results: AxeResults = null as any;
      await act(async () => {
        results = await axe(container);
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe("user events", () => {
    it("should toggle on button click", () => {
      let { getByRole, baseElement } = render(
        <Menu>
          <MenuButton id="example-button">
            Actions <span aria-hidden="true">▾</span>
          </MenuButton>
          <MenuList portal={false}>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
            <MenuItem onSelect={jest.fn}>Create a Copy</MenuItem>
            <MenuItem onSelect={jest.fn}>Mark as Draft</MenuItem>
            <MenuItem onSelect={jest.fn}>Delete</MenuItem>
          </MenuList>
        </Menu>
      );

      let getPopover = () =>
        baseElement.querySelector("[data-reach-menu-popover]");

      expect(getPopover()).not.toBeVisible();
      clickButton(getByRole("button"));
      expect(getPopover()).toBeVisible();
      clickButton(getByRole("button"));
      expect(getPopover()).not.toBeVisible();
    });

    it("should not re-focus the button when user selects an item with click", () => {
      let { getByRole, getByText } = render(
        <Menu>
          <MenuButton id="example-button">Actions</MenuButton>
          <MenuList portal={false}>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
          </MenuList>
        </Menu>
      );

      clickButton(getByRole("button"));
      clickButton(getByText("Download"));
      expect(getByRole("button")).not.toHaveFocus();
    });

    it("should manage focus when user selects an item with `Space` key", () => {
      let { getByRole, getByText } = render(
        <Menu>
          <MenuButton id="example-button">Actions</MenuButton>
          <MenuList portal={false}>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
          </MenuList>
        </Menu>
      );

      fireEvent.keyDown(getByRole("button"), { key: " " });
      fireEvent.keyDown(getByText("Download"), { key: " " });
      expect(getByRole("button")).toHaveFocus();
    });

    it("should manage focus when user selects an item with `Enter` key", () => {
      let { getByRole, getByText } = render(
        <Menu>
          <MenuButton id="example-button">Actions</MenuButton>
          <MenuList portal={false}>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
          </MenuList>
        </Menu>
      );

      fireEvent.keyDown(getByRole("button"), { key: "Enter" });
      fireEvent.keyDown(getByText("Download"), { key: "Enter" });

      expect(getByRole("button")).toHaveFocus();
    });

    it("should manage focus when user dismisses with the `Escape` key", () => {
      let { getByRole, getByText } = render(
        <Menu>
          <MenuButton id="example-button">Actions</MenuButton>
          <MenuList portal={false}>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
          </MenuList>
        </Menu>
      );

      clickButton(getByRole("button"));
      fireEvent.keyDown(getByText("Download"), { key: "Escape" });

      expect(getByRole("button")).toHaveFocus();
    });

    it("should not manage focus when user clicks outside element", () => {
      let { getByRole, getByTestId } = render(
        <>
          <Menu>
            <MenuButton id="example-button">Actions</MenuButton>
            <MenuList portal={false}>
              <MenuItem onSelect={jest.fn}>Download</MenuItem>
            </MenuList>
          </Menu>
          <input type="text" data-testid="input" />
        </>
      );

      clickButton(getByRole("button"));
      fireEvent.click(getByTestId("input"));
      expect(getByRole("button")).not.toHaveFocus();
    });
  });
});

/**
 * Menu opens on mousedown, not click!
 * @param element
 */
function clickButton(element: HTMLElement) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
}
