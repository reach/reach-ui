import adapt from "@reach/adapter";
import { container, button, popover, menu, item } from "./defs";

export const MenuContainer = adapt(container);
export const MenuButton = adapt(button);
export const MenuPopover = adapt(popover);
export const Menu = adapt(menu);
export const MenuItem = adapt(item, {
  registerDescendant: props => {
    return { name: props.children, onSelect: props.onSelect };
  }
});
