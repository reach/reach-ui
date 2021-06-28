import * as React from "react";
import { render, screen, simulateMouseClick } from "$test/utils";
import { axe } from "jest-axe";
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuLink,
} from "@reach/menu-button";

describe("<MenuButton /> with axe", () => {
  describe("with <MenuItem />", () => {
    it("Should not have ARIA violations", async () => {
      jest.useRealTimers();
      let { container, list, button } = renderTestMenu();

      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Toggle the menu and check again
      simulateMouseClick(button);
      results = await axe(container);

      // We have to check the container and list separately since the list is
      // portaled outside of the container.
      let listResults = await axe(list);

      expect(results).toHaveNoViolations();
      expect(listResults).toHaveNoViolations();
    });
  });

  describe("with <MenuLink />", () => {
    it("Should not have ARIA violations", async () => {
      jest.useRealTimers();
      let { container, list, button } = renderTestMenuWithLinks();

      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Toggle the menu and check again
      simulateMouseClick(button);
      results = await axe(container);

      // We have to check the container and list separately since the list is
      // portaled outside of the container.
      let listResults = await axe(list);

      expect(results).toHaveNoViolations();
      expect(listResults).toHaveNoViolations();
    });
  });

  describe("with <MenuItem /> and <MenuLink />", () => {
    it("Should not have ARIA violations", async () => {
      jest.useRealTimers();
      let { container, list, button } = renderTestMenuWithLinksAndItems();

      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Toggle the menu and check again
      simulateMouseClick(button);
      results = await axe(container);

      // We have to check the container and list separately since the list is
      // portaled outside of the container.
      let listResults = await axe(list);

      expect(results).toHaveNoViolations();
      expect(listResults).toHaveNoViolations();
    });
  });
});

function renderTestMenu() {
  let cb1 = jest.fn();
  let cb2 = jest.fn();
  let { getByRole, container } = render(
    <Menu>
      <MenuButton>
        Actions <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList data-testid="list">
        <MenuItem onSelect={cb1}>Download</MenuItem>
        <MenuItem onSelect={cb2}>Create a Copy</MenuItem>
      </MenuList>
    </Menu>
  );
  return {
    container,
    get root() {
      return document.body;
    },
    get button() {
      return getByRole("button");
    },
    get list() {
      return screen.getByTestId("list");
    },
    get items() {
      return [screen.getByText("Download"), screen.getByText("Create a Copy")];
    },
    selectCallbacks: [cb1, cb2],
  };
}

function renderTestMenuWithLinks() {
  let cb1 = jest.fn();
  let cb2 = jest.fn();
  let { getByRole, container } = render(
    <Menu>
      <MenuButton>
        Navigation <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList data-testid="list">
        <MenuLink href="/" onSelect={cb1}>
          Home
        </MenuLink>
        <MenuLink href="/about" onSelect={cb2}>
          About
        </MenuLink>
      </MenuList>
    </Menu>
  );
  return {
    container,
    get root() {
      return document.body;
    },
    get button() {
      return getByRole("button");
    },
    get list() {
      return screen.getByTestId("list");
    },
    get items() {
      return [screen.getByText("Home"), screen.getByText("About")];
    },
    selectCallbacks: [cb1, cb2],
  };
}

function renderTestMenuWithLinksAndItems() {
  let cb1 = jest.fn();
  let cb2 = jest.fn();
  let { getByRole, container } = render(
    <Menu>
      <MenuButton>
        Actions and Links <span aria-hidden="true">▾</span>
      </MenuButton>
      <MenuList data-testid="list">
        <MenuItem onSelect={cb1}>Download</MenuItem>
        <MenuLink href="/about" onSelect={cb2}>
          About
        </MenuLink>
      </MenuList>
    </Menu>
  );
  return {
    container,
    get root() {
      return document.body;
    },
    get button() {
      return getByRole("button");
    },
    get list() {
      return screen.getByTestId("list");
    },
    get items() {
      return [screen.getByText("Home"), screen.getByText("About")];
    },
    selectCallbacks: [cb1, cb2],
  };
}
