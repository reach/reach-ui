import * as React from "react";

/** @deprecated */
export function createNamedContext<ContextValueType>(
	name: string,
	defaultValue: ContextValueType
): React.Context<ContextValueType> {
	let Ctx = React.createContext<ContextValueType>(defaultValue);
	Ctx.displayName = name;
	return Ctx;
}

////////////////////////////////////////////////////////////////////////////////

type ContextProvider<T> = React.FC<React.PropsWithChildren<T>>;

export function createContext<ContextValueType extends object | null>(
	rootComponentName: string,
	defaultContext?: ContextValueType
): [
	ContextProvider<ContextValueType>,
	(callerComponentName: string) => ContextValueType
] {
	let Ctx = React.createContext<ContextValueType | undefined>(defaultContext);

	function Provider(props: React.PropsWithChildren<ContextValueType>) {
		let { children, ...context } = props;
		let value = React.useMemo(
			() => context,
			// eslint-disable-next-line react-hooks/exhaustive-deps
			Object.values(context)
		) as ContextValueType;
		return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
	}

	function useContext(callerComponentName: string) {
		let context = React.useContext(Ctx);
		if (context) {
			return context;
		}
		if (defaultContext) {
			return defaultContext;
		}
		throw Error(
			`${callerComponentName} must be rendered inside of a ${rootComponentName} component.`
		);
	}

	Ctx.displayName = `${rootComponentName}Context`;
	Provider.displayName = `${rootComponentName}Provider`;
	return [Provider, useContext];
}
