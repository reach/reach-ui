import * as React from "react";
import { action } from "@storybook/addon-actions";
import { Menu, MenuList, MenuButton, MenuItem } from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "Conditional Items";

function Example() {
  const [activeItem, setActiveItem] = React.useState(false);

  /*
   * Simulate the menu list changing while the user is navigating.
   * This is always super annoying and should be avoided at all costs.
   * However, in the event that it does happen, we should at least ensure that
   * the selected item doesn't change right before the user selects with a
   * keyboard. Not much we can do to prevent mouse clicks from selecting a new
   * or wrong item here, hence why devs should avoid this behavior!
   */
  const [disappearingItem, setDisappearingItem] = React.useState(false);
  React.useEffect(() => {
    let interval = window.setInterval(() => {
      setDisappearingItem(!disappearingItem);
    }, 3000);
    return () => void window.clearInterval(interval);
  }, [disappearingItem]);
  return (
    <>
      <Menu>
        <MenuButton>
          Actions <span aria-hidden="true">▾</span>
        </MenuButton>
        <MenuList>
          {disappearingItem && (
            <MenuItem onSelect={action("Surprise")}>Surprise!</MenuItem>
          )}
          <MenuItem onSelect={action("Download")}>Download</MenuItem>
          {activeItem && (
            <MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
          )}
          <MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
          {disappearingItem && (
            <MenuItem onSelect={action("Surprise")}>Surprise Again!</MenuItem>
          )}
          <MenuItem onSelect={action("Delete")}>Delete</MenuItem>
        </MenuList>
      </Menu>
      <button onClick={() => void setActiveItem(!activeItem)}>
        Toggle Copy Option
      </button>
    </>
  );
}

Example.storyName = name;
export { Example };
