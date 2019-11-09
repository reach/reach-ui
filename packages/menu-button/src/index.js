import adapt from "./use-machine";
import { container, button, popover, menu, item } from "./defs";

// TODO: rename to MenuContainer
export const MenuProvider = adapt(container);
export const MenuButton = adapt(button);
export const MenuPopover = adapt(popover);
export const Menu = adapt(menu);
export const MenuItem = adapt(item, {
  registerDescendant: props => {
    return { name: props.children, onSelect: props.onSelect };
  }
});
