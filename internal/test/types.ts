import type {
	queries,
	RenderOptions as TLRenderOptions,
	RenderResult as TLRenderResult,
} from "@testing-library/react";

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
