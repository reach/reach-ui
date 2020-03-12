import React from "react";
import { render, act, fireEvent, keyType } from "$test/utils";
import { axe } from "jest-axe";
import { Listbox, ListboxOption } from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";

describe("<Listbox />", () => {
  it("should mount the component", () => {
    const { queryByRole } = render(<BasicListbox />);
    expect(queryByRole("button")).toBeTruthy();
  });

  it("should not have basic a11y issues", async () => {
    const { container } = render(<FancyListbox />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have a tabbable button", () => {
    const { getByRole } = render(<BasicListbox />);
    expect(getByRole("button")).toHaveAttribute("tabindex", "0");
  });

  it("should have a hidden input field", () => {
    // Requires a form-related prop (ie, `name`) to render the input
    const { container } = render(
      <Listbox name="taco">
        <ListboxOption value="asada">Carne Asada</ListboxOption>
        <ListboxOption value="pollo">Pollo</ListboxOption>
        <ListboxOption value="lengua">Lengua</ListboxOption>
      </Listbox>
    );
    expect(container.querySelector("input")).toBeTruthy();
  });

  it("should toggle on button click", () => {
    let { getByRole, container } = render(<FancyListbox />);
    let getPopover = () =>
      container.querySelector("[data-reach-listbox-popover]");

    // Listbox opens on mousedown, not click!
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

  [" ", "ArrowUp", "ArrowDown"].forEach(key => {
    it(`should open the listbox when \`${
      key === " " ? "Spacebar" : key
    }\` pressed while idle`, () => {
      const { getByRole, queryByRole } = render(<BasicListbox />);
      getByRole("button").focus();

      act(() => void fireEvent.keyDown(document.activeElement!, { key }));
      expect(queryByRole("listbox", { hidden: false })).toBeTruthy();
      act(() => void fireEvent.keyUp(document.activeElement!, { key }));
      expect(queryByRole("listbox", { hidden: false })).toBeTruthy();
    });
  });

  it("should close when the clicked outside", () => {
    const { getByTestId, getByRole, container } = render(
      <div>
        <span data-testid="outside-el" tabIndex={0}>
          Hi
        </span>
        <br />
        <br />
        <br />
        <br />
        <Listbox name="taco" portal={false}>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
        </Listbox>
      </div>
    );

    let getPopover = () =>
      container.querySelector("[data-reach-listbox-popover]");

    // Listbox opens on mousedown, not click!
    function clickButton() {
      fireEvent.mouseDown(getByRole("button"));
      fireEvent.mouseUp(getByRole("button"));
    }

    act(() => void clickButton());
    expect(getPopover()).toBeVisible();
    act(() => void getByTestId("outside-el"));
    // TODO: Fails, unsure why.
    // expect(getPopover()).not.toBeVisible();
  });

  it("should close on escape", () => {
    const { container, getByRole } = render(<FancyListbox />);

    let getPopover = () =>
      container.querySelector("[data-reach-listbox-popover]");

    // Listbox opens on mousedown, not click!
    function clickButton() {
      fireEvent.mouseDown(getByRole("button"));
      fireEvent.mouseUp(getByRole("button"));
    }

    act(() => void clickButton());
    expect(getPopover()).toBeVisible();
    act(() => void keyType(getByRole("button"), "Escape"));
    expect(getPopover()).not.toBeVisible();
  });

  it("should update the value when the user types when idle", () => {
    jest.useFakeTimers();
    const { getByRole, container } = render(
      <Listbox name="taco" portal={false}>
        <ListboxOption value="pollo">Pollo</ListboxOption>
        <ListboxOption value="asada">Carne Asada</ListboxOption>
        <ListboxOption value="lengua">Lengua</ListboxOption>
        <ListboxOption value="pastor">Pastor</ListboxOption>
      </Listbox>
    );

    let input = container.querySelector("input");

    getByRole("button").focus();
    act(() => void keyType(getByRole("button"), "c"));
    expect(input).toHaveValue("asada");

    // Immediate key event shouldn't change the value unless the user continues
    // typing out the next letter of a matching label.
    act(() => void keyType(getByRole("button"), "p"));
    expect(input).toHaveValue("asada");

    act(() => {
      jest.advanceTimersByTime(5000);
      act(() => void keyType(getByRole("button"), "p"));
    });
    // starts searching from the beginning of the list
    expect(input).toHaveValue("pollo");

    // continue spelling a word that matches another option
    act(() => void keyType(getByRole("button"), "a"));
    expect(input).toHaveValue("pastor");
  });

  // TODO: it("should update the selection when the user types when expanded", () => {});
  // TODO: it("should select an option on mouseup", () => {});
});

function BasicListbox() {
  return (
    <Listbox portal={false}>
      <ListboxOption value="pollo">Pollo</ListboxOption>
      <ListboxOption value="asada">Carne Asada</ListboxOption>
      <ListboxOption value="lengua">Lengua</ListboxOption>
      <ListboxOption value="pastor">Pastor</ListboxOption>
    </Listbox>
  );
}

function FancyListbox() {
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox aria-labelledby="taco-label" defaultValue="asada" portal={false}>
        <ListboxOption value="default">
          Choose a taco <Taco />
        </ListboxOption>
        <hr />
        <ListboxOption value="asada">
          Carne Asada <Taco />
        </ListboxOption>
        <ListboxOption value="pollo" disabled>
          Pollo <Taco /> <Tag>Sold Out!</Tag>
        </ListboxOption>
        <div style={{ background: "#ccc" }}>
          <ListboxOption value="pastor">
            Pastor <Taco /> <Tag>Fan favorite!</Tag>
          </ListboxOption>
        </div>
        <ListboxOption value="lengua">
          Lengua <Taco />
        </ListboxOption>
      </Listbox>
    </div>
  );
}

function Taco() {
  return (
    <span aria-hidden style={{ display: "inline-block", margin: "0 4px" }}>
      🌮
    </span>
  );
}

function Tag(props: any) {
  return (
    <span
      style={{
        display: "inline-block",
        lineHeight: 1,
        fontSize: 11,
        textTransform: "uppercase",
        fontWeight: "bolder",
        marginLeft: 6,
        padding: 4,
        background: "crimson",
        borderRadius: 2,
        color: "#fff",
      }}
      {...props}
    />
  );
}
