declare module "@reach/menu-button" {
  import * as React from "react";

  export type ButtonRect = DOMRect;

  export interface MenuItemState {
    isOpen: boolean;
    closingWithClick: boolean;
    selectionIndex: number;
    buttonRect: undefined | ButtonRect;
    buttonId: string;
  }

  export interface MenuProps {
    children: React.ReactNode;
  }

  export type MenuButtonProps = React.HTMLProps<HTMLButtonElement> & {
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
    children: React.ReactNode;
  };

  export type MenuListProps = React.HTMLProps<HTMLDivElement> & {
    children: React.ReactNode;
  };

  type ResolvedMenuLinkProps<T> = T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : T;

  type ResolvedMenuLinkComponent<T> = T extends keyof JSX.IntrinsicElements
    ? T
    : React.ComponentType<T>;

  export type MenuLinkProps<
    T extends SupportedMenuLinkComponent
  > = ResolvedMenuLinkProps<T> & {
    to?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    component?: ResolvedMenuLinkComponent<T>;
    index?: number;
    style?: React.CSSProperties;
    setState?: (s: MenuItemState) => Partial<MenuItemState>;
    state?: MenuItemState;
    _ref?: (node: HTMLElement) => void;
  };

  type SupportedMenuLinkComponent = object | keyof JSX.IntrinsicElements;

  export type MenuItemProps = React.HTMLProps<HTMLDivElement> & {
    onSelect: () => void;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
    onMouseMove?: (e: React.MouseEvent<HTMLElement>) => void;
    role?: string;
    state?: MenuItemState;
    setState?: (s: MenuItemState) => Partial<MenuItemState>;
    index?: number;
    _ref?: (node: HTMLElement) => void;
  };

  export function MenuLink<T extends SupportedMenuLinkComponent>(
    props: MenuLinkProps<T>
  ): React.ReactElement<MenuLinkProps<T>>;

  export const Menu: React.FunctionComponent<MenuProps>;
  export const MenuButton: React.FunctionComponent<MenuButtonProps>;
  export const MenuList: React.FunctionComponent<MenuListProps>;
  export const MenuItem: React.FunctionComponent<MenuItemProps>;
}
