import * as React from "react";
import { render, act, fireEvent, keyType } from "$test/utils";
import {
  Listbox,
  ListboxButton,
  ListboxInput,
  ListboxPopover,
  ListboxOption,
  ListboxList,
  ListboxProps,
} from "@reach/listbox";
import VisuallyHidden from "@reach/visually-hidden";
import { spy } from "sinon";

// NOTE: Render portal'd listboxes in an `act` call, as they update React state
//       when mounted.

describe("<Listbox />", () => {
  describe("rendering", () => {
    it("should mount the component", () => {
      let { queryByRole } = render(
        <Listbox portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );
      expect(queryByRole("button")).toBeTruthy();
    });

    it("should mount the composed component", () => {
      act(() => {
        let { queryByRole } = render(
          <ListboxInput>
            <ListboxButton />
            <ListboxPopover>
              <ListboxList>
                <ListboxOption value="asada">Carne Asada</ListboxOption>
                <ListboxOption value="pollo">Pollo</ListboxOption>
                <ListboxOption value="lengua">Lengua</ListboxOption>
              </ListboxList>
            </ListboxPopover>
          </ListboxInput>
        );
        expect(queryByRole("button")).toBeTruthy();
      });
    });

    it("should mount with render props", async () => {
      let { queryByRole } = render(
        <ListboxInput>
          {() => (
            <React.Fragment>
              <ListboxButton />
              <ListboxPopover>
                <ListboxList>
                  <ListboxOption value="asada">Carne Asada</ListboxOption>
                  <ListboxOption value="pollo">Pollo</ListboxOption>
                  <ListboxOption value="lengua">Lengua</ListboxOption>
                </ListboxList>
              </ListboxPopover>
            </React.Fragment>
          )}
        </ListboxInput>
      );
      expect(queryByRole("button")).toBeTruthy();
    });

    // TODO: Write this test maybe?
    // it("should not render on outside clicks when the listbox is closed", () => {
    // })
  });

  describe("a11y", () => {
    it("renders a valid listbox", () => {
      let { queryByRole, getByRole } = render(
        <Listbox portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );

      // Since a closed listbox is hidden, it won't be visible to the
      // accessibility tree which means queryByRole will fail. Open the listbox
      // and then find by role.
      act(() => {
        fireMouseClick(getByRole("button"));
      });

      expect(queryByRole("listbox")).toBeTruthy();
    });

    it("should have a tabbable button", () => {
      let { getByRole } = render(
        <Listbox portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );
      expect(getByRole("button")).toHaveAttribute("tabindex", "0");
    });

    //   TODO: it("should focus the list when open", () => {
    //     let { getByRole } = render(
    //       <Listbox portal={false}>
    //         <ListboxOption value="pollo">Pollo</ListboxOption>
    //         <ListboxOption value="asada">Carne Asada</ListboxOption>
    //         <ListboxOption value="lengua">Lengua</ListboxOption>
    //         <ListboxOption value="pastor">Pastor</ListboxOption>
    //       </Listbox>
    //     );

    //     act(() => {
    //       fireMouseClick(getByRole("button"));
    //     });

    //     // May use small timeout or requestAnimationFrame
    //     jest.advanceTimersByTime(10);
    //     expect(getByRole("listbox")).toHaveFocus();
    //   });

    it('sets `aria-expanded="true"` when the listbox is open', () => {
      let { getByRole } = render(
        <Listbox portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );
      act(() => void fireMouseClick(getByRole("button")));
      expect(getByRole("button")).toHaveAttribute("aria-expanded", "true");
    });

    it("removes `aria-expanded` when the listbox is closed", () => {
      let { getByRole } = render(
        <Listbox portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );
      expect(getByRole("button")).not.toHaveAttribute("aria-expanded");
    });

    it('sets `aria-haspopup` to `"listbox"` on the button', () => {
      let { getByRole } = render(
        <Listbox portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );
      expect(getByRole("button")).toHaveAttribute("aria-haspopup", "listbox");
    });
  });

  describe("as a form input", () => {
    it("should not have a hidden input field when form props are not provided", () => {
      act(() => {
        let { container } = render(
          <Listbox>
            <ListboxOption value="asada">Carne Asada</ListboxOption>
            <ListboxOption value="pollo">Pollo</ListboxOption>
            <ListboxOption value="lengua">Lengua</ListboxOption>
          </Listbox>
        );
        expect(container.querySelector("input")).not.toBeTruthy();
      });
    });

    it("should have a hidden input field when `name` prop is provided", () => {
      act(() => {
        let { container } = render(
          <Listbox name="taco">
            <ListboxOption value="asada">Carne Asada</ListboxOption>
            <ListboxOption value="pollo">Pollo</ListboxOption>
            <ListboxOption value="lengua">Lengua</ListboxOption>
          </Listbox>
        );
        expect(container.querySelector("input")).not.toBeVisible();
      });
    });

    it("should have a hidden input field when `form` prop is provided", () => {
      act(() => {
        let { container } = render(
          <div>
            <form id="my-form">
              <label>
                Name
                <input type="text" name="name" data-ignore="" />
              </label>
              <button>Submit</button>
            </form>
            <Listbox form="my-form">
              <ListboxOption value="asada">Carne Asada</ListboxOption>
              <ListboxOption value="pollo">Pollo</ListboxOption>
              <ListboxOption value="lengua">Lengua</ListboxOption>
            </Listbox>
          </div>
        );
        expect(
          container.querySelector("input:not([data-ignore])")
        ).not.toBeVisible();
      });
    });

    it("should have a hidden required input field when `required` prop is provided", () => {
      act(() => {
        let { container } = render(
          <Listbox required>
            <ListboxOption value="asada">Carne Asada</ListboxOption>
            <ListboxOption value="pollo">Pollo</ListboxOption>
            <ListboxOption value="lengua">Lengua</ListboxOption>
          </Listbox>
        );
        expect(container.querySelector("input")).not.toBeVisible();
        expect(container.querySelector("input")).toHaveAttribute("required");
      });
    });
  });

  describe("user events", () => {
    it("should toggle on button click", () => {
      let { getByRole, container } = render(<FancyListbox />);

      expect(getPopover(container)).not.toBeVisible();

      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover(container)).toBeVisible();

      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover(container)).not.toBeVisible();
    });

    [" ", "ArrowUp", "ArrowDown"].forEach((key) => {
      it(`should open the listbox when \`${
        key === " " ? "Spacebar" : key
      }\` pressed while idle`, () => {
        let { getByRole, queryByRole } = render(
          <Listbox portal={false}>
            <ListboxOption value="pollo">Pollo</ListboxOption>
            <ListboxOption value="asada">Carne Asada</ListboxOption>
            <ListboxOption value="lengua">Lengua</ListboxOption>
            <ListboxOption value="pastor">Pastor</ListboxOption>
          </Listbox>
        );

        act(() => {
          getByRole("button").focus();
          fireEvent.keyDown(document.activeElement!, { key });
        });
        expect(queryByRole("listbox", { hidden: false })).toBeTruthy();

        act(() => void fireEvent.keyUp(document.activeElement!, { key }));
        expect(queryByRole("listbox", { hidden: false })).toBeTruthy();
      });
    });

    it(`should submit a form when \`Enter\` pressed while idle`, () => {
      let handleSubmit = spy();
      let { getByTestId } = render(
        <div>
          <form
            id="my-form"
            onSubmit={(event) => {
              // HTMLFormElement.prototype.submit is not implemented in jsdom
              // preventDefault will stop the event and the error
              event.preventDefault();
              handleSubmit();
            }}
          >
            <label>
              Name
              <input type="text" name="name" />
            </label>
            <span id="taco-label">Favorite taco</span>
            <ListboxInput name="taco" aria-labelledby="taco-label">
              <ListboxButton data-testid="listbox-button" />
              <ListboxPopover portal={false}>
                <ListboxList>
                  <ListboxOption value="asada">Carne Asada</ListboxOption>
                  <ListboxOption value="pollo">Pollo</ListboxOption>
                  <ListboxOption value="lengua">Lengua</ListboxOption>
                </ListboxList>
              </ListboxPopover>
            </ListboxInput>
            <input type="submit" value="Submit" />
          </form>
        </div>
      );

      getByTestId("listbox-button").focus();

      act(
        () =>
          void fireEvent.keyDown(document.activeElement!, {
            key: "Enter",
          })
      );
      expect(handleSubmit.calledOnce).toBe(true);
    });

    it("should close when clicked outside", () => {
      let { getByTestId, getByRole, container } = render(
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

      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover(container)).toBeVisible();

      act(() => void fireEvent.mouseDown(getByTestId("outside-el")));
      expect(getPopover(container)).not.toBeVisible();
    });

    it("should close on escape", () => {
      let { container, getByRole } = render(<FancyListbox />);

      act(() => void fireMouseClick(getByRole("button")));
      expect(getPopover(container)).toBeVisible();

      act(() => void keyType(getByRole("button"), "Escape"));
      expect(getPopover(container)).not.toBeVisible();
    });

    it("should update the value when the user types while idle", () => {
      jest.useFakeTimers();
      let { getByRole, container } = render(
        <Listbox name="taco" portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );

      let input = container.querySelector("input");

      act(() => {
        getByRole("button").focus();
        keyType(getByRole("button"), "c");
      });
      expect(input).toHaveValue("asada");

      // Immediate key event shouldn't change the value unless the user continues
      // typing out the next letter of a matching label.
      act(() => void keyType(getByRole("button"), "p"));
      expect(input).toHaveValue("asada");

      act(() => {
        jest.advanceTimersByTime(5000);
        keyType(getByRole("button"), "p");
      });
      // starts searching from the beginning of the list
      expect(input).toHaveValue("pollo");

      // continue spelling a word that matches another option
      act(() => void keyType(getByRole("button"), "a"));
      expect(input).toHaveValue("pastor");

      jest.useRealTimers();
    });

    it("should update the selection when the user types while expanded", () => {
      jest.useFakeTimers();
      let { getByRole, getAllByText } = render(
        <Listbox portal={false}>
          <ListboxOption value="pollo">Pollo</ListboxOption>
          <ListboxOption value="asada">Carne Asada</ListboxOption>
          <ListboxOption value="lengua">Lengua</ListboxOption>
          <ListboxOption value="pastor">Pastor</ListboxOption>
        </Listbox>
      );

      /**
       * getByText alone may fail because the button may have the same inner
       * text as an option.
       * @param text
       */
      function getOptionByText(text: string) {
        return getAllByText(text).find(
          (element) => element.getAttribute("role") === "option"
        );
      }

      act(() => {
        fireMouseClick(getByRole("button"));
      });

      act(() => {
        keyType(getByRole("listbox"), "c");
      });

      expect(getOptionByText("Carne Asada")).toHaveAttribute(
        "aria-selected",
        "true"
      );

      // Immediate key event shouldn't change the value unless the user
      // continues typing out the next letter of a matching label.
      act(() => void keyType(getByRole("button"), "p"));
      expect(getOptionByText("Carne Asada")).toHaveAttribute(
        "aria-selected",
        "true"
      );

      act(() => {
        jest.advanceTimersByTime(5000);
        act(() => void keyType(getByRole("button"), "p"));
      });
      // starts searching from the beginning of the list
      expect(getOptionByText("Pollo")).toHaveAttribute("aria-selected", "true");

      // continue spelling a word that matches another option
      act(() => void keyType(getByRole("button"), "a"));
      expect(getOptionByText("Pastor")).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    // TODO: it("should select an option on mouseup", () => {});
    // TODO: it("should prevent scrolling on `Spacebar`", () => {});
    // TODO: it("should prevent scrolling on `ArrowDown`", () => {});
    // TODO: it("should prevent scrolling on `ArrowUp`", () => {});
    // TODO: it("should prevent scrolling on `PageUp`", () => {});
    // TODO: it("should prevent scrolling on `PageDown`", () => {});
    // TODO: it("should call onChange", () => {});

    jest.useRealTimers();
  });
});

function FancyListbox(props: Partial<Omit<ListboxProps, "ref">>) {
  return (
    <div>
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <Listbox
        aria-labelledby="taco-label"
        defaultValue="asada"
        portal={false}
        {...props}
      >
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

/**
 * Listbox opens on mousedown, not click event
 * @param element
 */
function fireMouseClick(element: HTMLElement) {
  fireEvent.mouseDown(element);
  fireEvent.mouseUp(element);
}

function getPopover(container: Element) {
  return container.querySelector("[data-reach-listbox-popover]");
}
