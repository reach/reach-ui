import React, { Fragment } from "react";
import { render, act, fireEvent, fireClickAndMouseEvents } from "$test/utils";
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

      fireClickAndMouseEvents(getByRole("button"));
      expect(getPopover()).toBeVisible();
      fireClickAndMouseEvents(getByRole("button"));
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

      fireClickAndMouseEvents(getByRole("button"));
      fireClickAndMouseEvents(getByText("Download"));
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

      fireClickAndMouseEvents(getByRole("button"));
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

      fireClickAndMouseEvents(getByRole("button"));
      fireEvent.click(getByTestId("input"));
      expect(getByRole("button")).not.toHaveFocus();
    });

    it("should open and close on selection", () => {
      const onSelect = jest.fn();
      const { getByText, getByTestId } = render(
        <Menu>
          <MenuButton>MenuButton</MenuButton>
          <MenuList data-testid="menu-test-id">
            <MenuItem onSelect={onSelect}>First</MenuItem>
            <MenuItem onSelect={onSelect}>Second</MenuItem>
            <MenuItem onSelect={onSelect}>Third</MenuItem>
          </MenuList>
        </Menu>
      );

      const menu = getByTestId("menu-test-id");
      expect(menu).not.toBeVisible();

      const button = getByText("MenuButton");
      click(button);
      expect(menu).toBeVisible();

      const item = getByText("First");
      click(item);
      expect(onSelect).toHaveBeenCalled();
      expect(menu).not.toBeVisible();
    });
  });
});

function click(element: HTMLElement) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
}
