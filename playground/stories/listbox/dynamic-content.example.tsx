import * as React from "react";
import { VisuallyHidden } from "@reach/visually-hidden";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

let name = "Dynamic content";

function Example() {
  let [guestCount, setGuestCount] = React.useState(1);

  const options = Array.from({ length: guestCount }).map((_, i) => {
    const roomCount = i + 1;
    return {
      value: roomCount.toString(),
      label: `${roomCount} ${roomCount > 1 ? "rooms" : "room"}`,
    };
  });

  return (
    <div>
      <span>
        {guestCount} {guestCount > 1 ? "guests " : "guest "}
      </span>
      <button type="button" onClick={() => setGuestCount(guestCount + 1)}>
        Add one more guest
      </button>
      <hr />
      <VisuallyHidden id="room-label">Select rooms</VisuallyHidden>
      <Listbox aria-labelledby="room-label" defaultValue="1">
        {options.map((option) => (
          <ListboxOption
            key={option.value}
            value={option.value}
            label={option.label}
          >
            {option.label}
          </ListboxOption>
        ))}
      </Listbox>
    </div>
  );
}

Example.storyName = name;
export { Example };
