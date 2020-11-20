import React from "react";
import { Menu, MenuList, MenuButton, MenuLink } from "@reach/menu-button";
import "@reach/menu-button/styles.css";

let name = "Avoid Page Scroll on Menu Focus";

function Example() {
  const menus = [1, 2, 3, 4];
  const links = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  return (
    <div>
      <h2>Home</h2>
      {menus.map((mainIndex) => (
        <Menu key={`${mainIndex}`} keepScrollPosition={true}>
          <MenuButton>
            Actions {mainIndex} <span aria-hidden="true">▾</span>
          </MenuButton>
          <MenuList>
            {links.map((secondIndex) => (
              <MenuLink
                href={`#/${mainIndex}${secondIndex}`}
                key={`${mainIndex}_${secondIndex}`}
              >
                Link {secondIndex}
              </MenuLink>
            ))}
          </MenuList>
        </Menu>
      ))}
    </div>
  );
}

Example.story = { name };
export const Comp = Example;
export default { title: "MenuButton" };
