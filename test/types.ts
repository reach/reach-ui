import {
  queries,
  RenderOptions as TLRenderOptions,
  RenderResult as TLRenderResult,
} from "@testing-library/react";
import { axe } from "./vitest-axe";

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

export type AxeResults = Awaited<ReturnType<typeof axe>>;

export interface MatcherResult {
  message(): string;
  pass: boolean;
}
