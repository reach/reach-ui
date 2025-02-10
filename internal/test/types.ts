import type {
	queries,
	RenderOptions as TLRenderOptions,
	RenderResult as TLRenderResult,
} from "@testing-library/react";
import type {
	RenderHookOptions as TLLegacyRenderHookOptions,
	RenderHookResult as TLLegacyRenderHookResult,
} from "@testing-library/react-hooks";
import type {
	RenderHookOptions as TLActualRenderHookOptions,
	RenderHookResult as TLActualRenderHookResult,
} from "@testing-library/react-13";

export type RenderOptions = Omit<TLRenderOptions, "queries" | "wrapper"> & {
	strict?: boolean;
};

export type RenderResult<
	P extends React.HTMLAttributes<T>,
	T extends HTMLElement
> = TLRenderResult<typeof queries> & {
	setProps(props: P): RenderResult<P, T>;
	forceUpdate(): RenderResult<P, T>;
};

export type RenderHookOptions<TProps> = Omit<
	TLLegacyRenderHookOptions<TProps> &
		TLActualRenderHookOptions<TProps> & {
			strict?: boolean;
		},
	"wrapper"
>;

export type RenderHookResult<TResult, TProps> = TLLegacyRenderHookResult<
	TProps,
	TResult
> &
	TLActualRenderHookResult<TResult, TProps>;
