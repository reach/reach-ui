import * as React from "react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
	Links,
	LiveReload,
	Meta,
	NavLink,
	type NavLinkProps,
	Outlet,
	Scripts,
	ScrollRestoration,
	useCatch,
} from "@remix-run/react";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import { VisuallyHidden } from "@reach/visually-hidden";
import { useMatchMedia } from "~/hooks/match-media";
import { ReachLogo } from "~/ui/reach-logo";

import normalizeStyles from "~/styles/normalize.css";
import skeletonStyles from "~/styles/skeleton.css";
import syntaxStyles from "~/styles/syntax.css";
import appStyles from "~/styles/app.css";

export const meta: MetaFunction = () => {
	return {
		charset: "utf-8",
		title: "New Remix App",
		viewport: "width=device-width,initial-scale=1",
	};
};

export const links: LinksFunction = () => {
	return [
		// {
		// 	rel: "stylesheet",
		// 	href: "https://fonts.googleapis.com/css?family=Source+Code+Pro",
		// },
		{ rel: "stylesheet", href: normalizeStyles },
		{ rel: "stylesheet", href: skeletonStyles },
		{ rel: "stylesheet", href: syntaxStyles },
		{ rel: "stylesheet", href: appStyles },
	];
};

function NavItem({
	children,
	anchorRef,
	to,
	href,
}: React.PropsWithChildren<{
	anchorRef?: React.MutableRefObject<HTMLAnchorElement | null>;
	to?: NavLinkProps["to"];
	href?: string;
}>) {
	return (
		<li style={{ margin: 0, padding: 0 }}>
			{href ? (
				<a
					ref={anchorRef}
					className="NavLink"
					target="_blank"
					rel="noopener noreferrer"
					href={href}
				>
					{children} <span aria-hidden>↗</span>
				</a>
			) : (
				(() => {
					if (!to) throw Error("missing to prop");
					return (
						<NavLink ref={anchorRef} className="NavLink" to={to}>
							{children}
						</NavLink>
					);
				})()
			)}
		</li>
	);
}

export default function App() {
	return (
		<Document>
			<Layout currentYear="2022">
				<Outlet />
			</Layout>
		</Document>
	);
}

export function ErrorBoundary({ error }: { error: unknown }) {
	// @ts-ignore
	if (__DEV__) {
		console.error(error);
	}
	return (
		<React.Fragment>
			<h1>Uh Oh</h1>
			<p>
				Something went wrong and we&#39;re not quite sure what … the sadness.
			</p>
		</React.Fragment>
	);
}

export function CatchBoundary() {
	let caught = useCatch();
	return (
		<Document>
			<Layout currentYear="2022">
				{(() => {
					switch (caught.status) {
						case 404:
							return <Error404 />;
						default:
							throw Error(caught.statusText);
					}
				})()}
			</Layout>
		</Document>
	);
}

function Error404() {
	return (
		<React.Fragment>
			<h1>Not Found</h1>
			<p>You just hit a route that doesn&#39;t exist … the sadness.</p>
		</React.Fragment>
	);
}

function Document({ children }: React.PropsWithChildren<{}>) {
	return (
		<html lang="en">
			<head>
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}

function Layout({
	children,
	currentYear,
}: {
	children: React.ReactNode;
	currentYear: string;
}) {
	return (
		<React.Fragment>
			<SkipNavLink style={{ zIndex: 2 }} />

			<div id="container">
				<LayoutNav currentYear={currentYear} />
				<SkipNavContent>
					<div id="content">{children}</div>
				</SkipNavContent>
			</div>
		</React.Fragment>
	);
}

function LayoutNav({ currentYear }: { currentYear: string }) {
	let [isOpen, setIsOpen] = React.useState<null | boolean>(null);
	let navNode = React.useRef<HTMLAnchorElement | null>(null);
	let shouldShowToggleNav = useMatchMedia("(min-width: 800px)");
	React.useEffect(
		() => void setIsOpen((o) => (shouldShowToggleNav ? o : false)),
		[shouldShowToggleNav]
	);

	return (
		<React.Fragment>
			{shouldShowToggleNav ? (
				<button
					id="hamburger"
					style={{
						width: 40,
						height: 40,
						padding: 8,
						position: "absolute",
						left: 10,
						top: 10,
						border: "none",
						font: "inherit",
						textTransform: "none",
						fontSize: "80%",
						borderRadius: "50%",
						zIndex: 1,
					}}
					onFocus={(event) => event.stopPropagation()}
					onClick={() => {
						setIsOpen((isOpen) => {
							let nextState = !isOpen;
							if (nextState && navNode.current) {
								navNode.current.focus();
							}
							return nextState;
						});
					}}
				>
					<div aria-hidden="true">
						{Array.from({ length: 3 }).map((_, idx) => (
							<div
								key={idx}
								style={{
									height: 3,
									background: "white",
									margin: "3px 0",
								}}
							/>
						))}
					</div>
					<VisuallyHidden>Toggle Nav</VisuallyHidden>
				</button>
			) : null}
			<div
				id="nav"
				style={{
					left: isOpen == null ? undefined : isOpen ? 0 : -250,
				}}
				onFocus={() => shouldShowToggleNav && setIsOpen(true)}
				onBlur={() => shouldShowToggleNav && setIsOpen(false)}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						width: "100%",
						minHeight: "100%",
					}}
				>
					<Header>
						<nav>
							<NavList>
								<NavItem to="/" anchorRef={navNode}>
									Home
								</NavItem>
								<NavItem href="https://github.com/reach/reach-ui">
									GitHub
								</NavItem>
							</NavList>

							<hr aria-hidden />

							<NavList>
								<NavItem to="/animation">Animation</NavItem>
								<NavItem to="/styling">Styling</NavItem>
							</NavList>

							<hr aria-hidden />

							<NavList>
								<NavItem to="/accordion">Accordion</NavItem>
								<NavItem to="/alert">Alert</NavItem>
								<NavItem to="/alert-dialog">Alert Dialog</NavItem>
								<NavItem to="/checkbox">Checkbox</NavItem>
								<NavItem to="/combobox">Combobox</NavItem>
								<NavItem to="/dialog">Dialog</NavItem>
								<NavItem to="/disclosure">Disclosure</NavItem>
								<NavItem to="/listbox">Listbox</NavItem>
								<NavItem to="/menu-button">Menu Button</NavItem>
								<NavItem to="/portal">Portal</NavItem>
								<NavItem to="/skip-nav">Skip Nav</NavItem>
								<NavItem to="/slider">Slider</NavItem>
								<NavItem to="/tabs">Tabs</NavItem>
								<NavItem to="/tooltip">Tooltip</NavItem>
								<NavItem to="/visually-hidden">Visually Hidden</NavItem>
							</NavList>

							<hr aria-hidden />

							<NavList>
								<NavItem to="/auto-id">Auto ID</NavItem>
								<NavItem to="/rect">Rect</NavItem>
								<NavItem to="/window-size">Window Size</NavItem>
							</NavList>
						</nav>
					</Header>
					<Footer year={currentYear} />
				</div>
			</div>
		</React.Fragment>
	);
}

function Header({ children }: { children: React.ReactNode }) {
	return (
		<header style={{ flex: 1 }}>
			<div style={{ padding: "30px 50px 20px 20px" }}>
				<ReachLogo />
			</div>

			<div style={{ height: 10 }} aria-hidden />
			{children}
		</header>
	);
}

function Footer({ year }: { year: string }) {
	return (
		<footer
			style={{
				marginTop: 100,
				color: "hsla(0, 100%, 100%, 0.75)",
				textAlign: "center",
				fontSize: "80%",
				padding: 5,
			}}
		>
			&copy; {year} React Training
		</footer>
	);
}

function NavList({ children }: { children: React.ReactNode }) {
	return (
		<ul style={{ margin: 0, padding: 0, listStyle: "none" }}>{children}</ul>
	);
}

// function NavTag(props) {
// 	return (
// 		<span
// 			style={{
// 				fontSize: 13,
// 				letterSpacing: 1.2,
// 				textTransform: "uppercase",
// 				padding: `0 0.25em`,
// 				marginLeft: "0.5em",
// 				display: "inlineBlock",
// 				background: `rgba(255,255,255,0.15)`,
// 				borderRadius: 3,
// 			}}
// 			{...props}
// 		/>
// 	);
// }

// function BetaTag() {
// 	return (
// 		<NavTag>
// 			<VisuallyHidden>Currently in </VisuallyHidden>Beta
// 		</NavTag>
// 	);
// }
