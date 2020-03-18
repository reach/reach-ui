import React from "react";
import { render, act, fireEvent } from "$test/utils";
import { AxeResults } from "$test/types";
import { axe } from "jest-axe";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";

describe("<MenuButton />", () => {
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
      act(() => void clickButton(getByRole("button")));
      expect(getPopover()).toBeVisible();
      act(() => void clickButton(getByRole("button")));
      expect(getPopover()).not.toBeVisible();
    });

    it("should manage focus when user selects an item with click", () => {
      let { getByRole, getByText } = render(
        <Menu>
          <MenuButton id="example-button">Actions</MenuButton>
          <MenuList portal={false}>
            <MenuItem onSelect={jest.fn}>Download</MenuItem>
          </MenuList>
        </Menu>
      );

      act(() => void clickButton(getByRole("button")));
      act(() => void clickButton(getByText("Download")));
      expect(getByRole("button")).toHaveFocus();
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

      act(() => void clickButton(getByRole("button")));
      act(() => void fireEvent.keyDown(getByText("Download"), { key: " " }));
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

      act(() => void clickButton(getByRole("button")));
      act(() => {
        fireEvent.keyDown(getByText("Download"), {
          key: "Enter",
        });
      });
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

      act(() => void clickButton(getByRole("button")));
      act(() => {
        fireEvent.keyDown(getByText("Download"), {
          key: "Escape",
        });
      });
      expect(getByRole("button")).toHaveFocus();
    });

    it("should NOT manage focus when user clicks outside element", () => {
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

      act(() => void clickButton(getByRole("button")));
      act(() => void fireEvent.click(getByTestId("input")));
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
