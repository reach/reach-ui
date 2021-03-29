import {
  queries,
  RenderOptions as TLRenderOptions,
  RenderResult as TLRenderResult,
} from "@testing-library/react";
import { axe } from "jest-axe";
import { ThenArg } from "@reach/utils/types";

export type EventElement = Document | Element | Window;

export type RenderOptions = Omit<TLRenderOptions, "queries"> & {
  strict?: boolean;
};

export type RenderResult<
  P extends React.HTMLAttributes<T>,
  T extends HTMLElement
> = TLRenderResult<typeof queries> & {
  setProps(props: P): RenderResult<P, T>;
  forceUpdate(): RenderResult<P, T>;
};

export type AxeResults = ThenArg<ReturnType<typeof axe>>;
