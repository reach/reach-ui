import * as React from "react";
import {
  ListboxInput,
  ListboxButton,
  ListboxOption,
  ListboxList,
  ListboxPopover,
  ListboxPopoverProps,
  useListboxContext,
} from "@reach/listbox";
import { Position, getCollisions } from "@reach/popover";
import VisuallyHidden from "@reach/visually-hidden";
import { action } from "@storybook/addon-actions";
import { Taco } from "./common";
import "@reach/listbox/styles.css";

// On MacOS, when a user opens a native select menu, the popover is positioned
// so that the current selected option appears directly on top of the trigger.
// Here we replicate that behavior assuming there are no collisions.
// If there are collisions, we can fallback to default positioning.

// The mouseup event shouldn't select the initial option and close the popover
// unless the user's mouse moves, which moves us into a `NAVIGATING` state
// similar to the native MacOS behavior.

// TODO: Add example of scrolling inside the popover to handle collisions

let name = "Position popover over selection option";

function Example() {
  let buttonRef = React.useRef<any>();
  return (
    <div>
      <p>
        Just giving us some space so you can avoid collisions and scroll.
        Listbox down below!
      </p>
      <div style={{ height: 200 }} />
      <VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
      <ListboxInput
        aria-labelledby="taco-label"
        onChange={action("Value changed")}
        style={{ position: "relative" }}
      >
        <ListboxButton arrow="▼" ref={buttonRef} />
        <PositionedPopover>
          <ListboxList>
            <ListboxOption value="default" label="Choose a taco">
              <Taco /> Choose a taco
            </ListboxOption>
            <hr />
            <ListboxOption value="asada" label="Carne Asada">
              <Taco /> Carne Asada
            </ListboxOption>
            <ListboxOption value="pollo" label="Pollo">
              <Taco /> Pollo
            </ListboxOption>
            <ListboxOption value="pastor" label="Pastor">
              <Taco /> Pastor
            </ListboxOption>
            <ListboxOption value="lengua" label="Lengua">
              <Taco /> Lengua
            </ListboxOption>
          </ListboxList>
        </PositionedPopover>
      </ListboxInput>
      <div style={{ height: 400 }} />
      <p>Bye now!</p>
    </div>
  );
}

function PositionedPopover({ ...props }: ListboxPopoverProps) {
  let { selectedOptionRef, isExpanded } = useListboxContext();
  let ref = React.useRef<any>();
  let [top, setTop] = React.useState<null | number>(null);

  React.useEffect(() => {
    if (isExpanded) {
      // In our popover's position function, we get access to the observed
      // popover rect. Howev er, we also need to get the rect of the selected
      // option element and adjust the popover in response. Because the popover
      // rect is updating as it changes via useRect, this will create an endless
      // update loop. Since we only need these values when the popover is
      // expanded, we'll update them only when state changes and calculate a
      // static `top` value to pass to our position function.
      let selectedRect = selectedOptionRef.current?.getBoundingClientRect();
      let popoverRect = ref.current?.getBoundingClientRect();
      if (!selectedRect || !popoverRect) {
        return;
      }

      setTop(
        selectedOptionRef.current
          ? popoverRect.top - selectedRect.top - selectedRect.height
          : null
      );
    } else {
      setTop(null);
    }
  }, [isExpanded, selectedOptionRef]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  let position = React.useCallback(getPosition(top), [top]);

  return <ListboxPopover {...props} ref={ref} position={position} />;
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

function getPosition(topOffset: number | null): Position {
  return function (targetRect, popoverRect) {
    const { directionUp, directionDown } = getCollisions(
      targetRect!,
      popoverRect!
    );
    const noCollisions = !directionUp && !directionDown;

    if (!targetRect || !popoverRect) {
      return {};
    }

    let topUp = `${targetRect.top - popoverRect.height + window.pageYOffset}px`;
    let topBottom = `${
      targetRect.top + targetRect.height + window.pageYOffset
    }px`;

    let topOverSelected =
      topOffset != null
        ? `${
            targetRect.top + targetRect.height + topOffset + window.pageYOffset
          }px`
        : topBottom;

    return {
      top: noCollisions ? topOverSelected : directionUp ? topUp : topBottom,
      width: targetRect.width,
      left: targetRect.left,
    };
  };
}
