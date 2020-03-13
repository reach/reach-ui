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

      // Menu opens on mousedown, not click!
      function clickButton() {
        fireEvent.mouseDown(getByRole("button"));
        fireEvent.mouseUp(getByRole("button"));
      }

      expect(getPopover()).not.toBeVisible();
      act(clickButton);
      expect(getPopover()).toBeVisible();
      act(clickButton);
      expect(getPopover()).not.toBeVisible();
    });
  });
});
