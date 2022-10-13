import * as React from "react";
import { matchSorter } from "match-sorter";
import {
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
} from "@reach/accordion";
import {
	AlertDialog,
	AlertDialogLabel,
	AlertDialogDescription,
} from "@reach/alert-dialog";
import { CustomCheckbox, MixedCheckbox } from "@reach/checkbox";
import {
	Combobox,
	ComboboxInput,
	ComboboxList,
	ComboboxOption,
	ComboboxPopover,
} from "@reach/combobox";
import { Dialog } from "@reach/dialog";
import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from "@reach/disclosure";
import { Listbox, ListboxOption } from "@reach/listbox";
import {
	Menu,
	MenuList,
	MenuButton,
	MenuItem,
	MenuLink,
} from "@reach/menu-button";
import { Popover, positionDefault, positionMatchWidth } from "@reach/popover";
import { Portal } from "@reach/portal";
import { Rect } from "@reach/rect";
import { SkipNavLink, SkipNavContent } from "@reach/skip-nav";
import { Slider, SliderMarker } from "@reach/slider";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import { Tooltip } from "@reach/tooltip";
import { VisuallyHidden } from "@reach/visually-hidden";
import { WindowSize } from "@reach/window-size";
import type { LinksFunction } from "@remix-run/node";
import cities, { type City } from "~/cities";

import accordionStyles from "@reach/accordion/styles.css";
import checkboxStyles from "@reach/checkbox/styles.css";
import comboboxStyles from "@reach/combobox/styles.css";
import dialogStyles from "@reach/dialog/styles.css";
import listboxStyles from "@reach/listbox/styles.css";
import menuButtonStyles from "@reach/menu-button/styles.css";
import skipNavStyles from "@reach/skip-nav/styles.css";
import sliderStyles from "@reach/slider/styles.css";
import tabsStyles from "@reach/tabs/styles.css";
import tooltipStyles from "@reach/tooltip/styles.css";

import customStyles from "~/styles.css";

export const links: LinksFunction = () => {
	return [
		{ rel: "stylesheet", href: accordionStyles },
		{ rel: "stylesheet", href: checkboxStyles },
		{ rel: "stylesheet", href: comboboxStyles },
		{ rel: "stylesheet", href: dialogStyles },
		{ rel: "stylesheet", href: listboxStyles },
		{ rel: "stylesheet", href: menuButtonStyles },
		{ rel: "stylesheet", href: skipNavStyles },
		{ rel: "stylesheet", href: sliderStyles },
		{ rel: "stylesheet", href: tabsStyles },
		{ rel: "stylesheet", href: tooltipStyles },

		// last!
		{ rel: "stylesheet", href: customStyles },
	];
};

const action =
	(...args: any[]) =>
	() =>
		console.log(...args);

export default function Index() {
	const closeAlertDialogLabelRef = React.useRef(null);
	const [showAlertDialog, setShowAlertDialog] = React.useState(false);
	const [showDialog, setShowDialog] = React.useState(false);
	const [mixedCheckboxIsChecked, setMixedCheckboxIsChecked] = React.useState<
		boolean | "mixed"
	>(false);
	let [term, setTerm] = React.useState("");
	let results = useCityMatch(term);

	const popoverRef = React.useRef<any>(null);
	const [popoverValue, setPopoverValue] = React.useState("");

	return (
		<div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
			<h1>Welcome to Remix</h1>
			<ul>
				<li>
					<a
						target="_blank"
						href="https://remix.run/tutorials/blog"
						rel="noreferrer"
					>
						15m Quickstart Blog Tutorial
					</a>
				</li>
				<li>
					<a
						target="_blank"
						href="https://remix.run/tutorials/jokes"
						rel="noreferrer"
					>
						Deep Dive Jokes App Tutorial
					</a>
				</li>
				<li>
					<a target="_blank" href="https://remix.run/docs" rel="noreferrer">
						Remix Docs
					</a>
				</li>
			</ul>
			<section>
				<h2>Accordion</h2>
				<Accordion
					defaultIndex={2}
					onChange={() => console.log(`Selecting panel`)}
				>
					<AccordionItem index={0}>
						<h3>
							<AccordionButton>You can activate me</AccordionButton>
						</h3>
						<AccordionPanel>
							Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
							consectetur pretium, lacus nunc consequat id viverra facilisi
							ligula eleifend, congue gravida malesuada proin scelerisque luctus
							est convallis.
						</AccordionPanel>
					</AccordionItem>
					<AccordionItem index={1} disabled>
						<h3>
							<AccordionButton>You can't touch me</AccordionButton>
						</h3>
						<AccordionPanel>
							Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
							consectetur pretium, lacus nunc consequat id viverra facilisi
							ligula eleifend, congue gravida malesuada proin scelerisque luctus
							est convallis.
						</AccordionPanel>
					</AccordionItem>
					<AccordionItem index={2}>
						<h3>
							<AccordionButton>You can definitely activate me</AccordionButton>
						</h3>
						<AccordionPanel>
							Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
							consectetur pretium, lacus nunc consequat id viverra facilisi
							ligula eleifend, congue gravida malesuada proin scelerisque luctus
							est convallis.
						</AccordionPanel>
					</AccordionItem>
				</Accordion>
			</section>
			<section>
				<h2>Alert Dialog</h2>
				<div>
					<button onClick={() => setShowAlertDialog(true)}>Show Dialog</button>
					{showAlertDialog && (
						<AlertDialog
							leastDestructiveRef={closeAlertDialogLabelRef}
							id="great-work"
						>
							<AlertDialogLabel>Confirmation!</AlertDialogLabel>
							<AlertDialogDescription>
								Are you sure you want to have that milkshake?
							</AlertDialogDescription>
							<p>
								<button>DESTROY Stuff!</button>{" "}
								<button
									ref={closeAlertDialogLabelRef}
									onClick={() => setShowAlertDialog(false)}
								>
									Cancel
								</button>
							</p>
						</AlertDialog>
					)}
				</div>
			</section>
			<section>
				<h2>Dialog</h2>
				<div>
					<button onClick={() => setShowDialog(true)}>Show Dialog</button>
					<Dialog
						aria-label="Announcement"
						isOpen={showDialog}
						onDismiss={() => setShowDialog(false)}
						allowPinchZoom
					>
						<button onClick={() => setShowDialog(false)}>Close Dialog</button>
						<p>This is killer!</p>
						<input type="text" />
						<br />
						<input type="text" />
						<button>Ayyyyyy</button>
					</Dialog>
				</div>
			</section>
			<section>
				<h2>Checkbox (custom)</h2>
				<div className="example">
					<form onSubmit={(e) => e.preventDefault()}>
						<div>
							<CustomCheckbox name="options" value="one" id="one" />
							<label htmlFor="one">Option 1</label>
							<label>
								<CustomCheckbox name="options" value="two" defaultChecked />
								Option 2
							</label>
							<br />
						</div>
						<div>
							<button type="reset">Reset</button>
						</div>
					</form>
				</div>
			</section>
			<section>
				<h2>Checkbox (mixed)</h2>
				<div>
					<div>
						<label>
							<MixedCheckbox checked="mixed" />
							Perma-mixed
						</label>
					</div>
					<div>
						<MixedCheckbox
							id="whatever-input"
							value="whatever"
							checked={mixedCheckboxIsChecked}
							onChange={(event) => {
								setMixedCheckboxIsChecked(event.target.checked);
							}}
						/>
						<label htmlFor="whatever-input">
							You must control the state WHATTTTTT
						</label>
						<button
							onClick={() => setMixedCheckboxIsChecked(!mixedCheckboxIsChecked)}
						>
							Toggle that checkbox baby
						</button>
						<button onClick={() => setMixedCheckboxIsChecked("mixed")}>
							Mix it up
						</button>
					</div>
				</div>
			</section>
			<section>
				<h2>Combobox</h2>
				<div>
					<Combobox data-testid="box" as="span">
						<ComboboxInput
							onChange={(event: any) => setTerm(event.target.value)}
						/>
						{results ? (
							<ComboboxPopover portal={false}>
								<ComboboxList data-testid="list" as="ul">
									{results.slice(0, 10).map((result, index) => (
										<ComboboxOption
											key={index}
											value={`${result.city}, ${result.state}`}
										/>
									))}
								</ComboboxList>
							</ComboboxPopover>
						) : null}
					</Combobox>
				</div>
			</section>
			<section>
				<h2>Disclosure</h2>
				<div>
					<Disclosure>
						<DisclosureButton>I have a secret</DisclosureButton>
						<DisclosurePanel>
							Ante rhoncus facilisis iaculis nostra faucibus vehicula ac
							consectetur pretium, lacus nunc consequat id viverra facilisi
							ligula eleifend, congue gravida malesuada proin scelerisque luctus
							est convallis.
						</DisclosurePanel>
					</Disclosure>
				</div>
			</section>
			<section>
				<h2>Listbox</h2>
				<div>
					<div>
						<VisuallyHidden id="taco-label">Choose a taco</VisuallyHidden>
						<Listbox
							aria-labelledby="taco-label"
							defaultValue="asada"
							onChange={() => console.log("listbox value changed")}
						>
							<ListboxOption value="default">Choose a taco</ListboxOption>
							<hr />
							<ListboxOption value="asada">Carne Asada</ListboxOption>
							<ListboxOption value="pollo" label="Pollo" disabled>
								Pollo (SOLD OUT)
							</ListboxOption>
							<div style={{ background: "#ccc" }}>
								<ListboxOption value="pastor" label="Pastor">
									Pastor (fan favorite!)
								</ListboxOption>
							</div>
							<ListboxOption value="lengua">Lengua</ListboxOption>
						</Listbox>
					</div>
				</div>
			</section>
			<section>
				<h2>Menu Button</h2>
				<div>
					<Menu>
						<MenuButton id="actions-button">
							Actions{" "}
							<span aria-hidden="true" style={{ userSelect: "none" }}>
								▾
							</span>
						</MenuButton>
						<MenuList>
							<MenuItem onSelect={action("Download")}>Download</MenuItem>
							<MenuItem onSelect={action("Copy")}>Create a Copy</MenuItem>
							<MenuItem onSelect={action("Mark as Draft")}>
								Mark as Draft
							</MenuItem>
							<MenuItem onSelect={action("Delete")}>Delete</MenuItem>
						</MenuList>
					</Menu>
					<Menu>
						<MenuButton id="links-button">
							Links{" "}
							<span aria-hidden="true" style={{ userSelect: "none" }}>
								▾
							</span>
						</MenuButton>
						<MenuList>
							<MenuLink href="https://google.com">Google</MenuLink>
							<MenuLink href="https://duckduckgo.com">Duck Duck Go</MenuLink>
						</MenuList>
					</Menu>
				</div>
			</section>
			<section>
				<h2>Popover</h2>
				<div>
					<textarea placeholder="resize me to move stuff around" />
					<textarea
						placeholder="Try typing 'match width'"
						ref={popoverRef}
						onChange={(event) => setPopoverValue(event.target.value)}
					/>

					{popoverValue.length > 0 && (
						<Popover
							targetRef={popoverRef}
							position={
								popoverValue === "match width"
									? positionMatchWidth
									: positionDefault
							}
						>
							<div
								style={{
									border: "solid 1px",
									padding: 10,
									background: "white",
									maxWidth: 400,
								}}
							>
								<p>Huzzah!!! I am here! WASSUPPPPP</p>
								<p>
									Tab navigation from the textarea that triggered this should
									now move to the button below.
								</p>
								<button>I should be the next tab</button>
							</div>
						</Popover>
					)}
					<button>and then tab to me after that one</button>
				</div>
			</section>
			<section>
				<h2>Portal</h2>
				<PortalExample />
			</section>
			<section>
				<h2>Rect</h2>
				<RectExample />
			</section>
			<section>
				<h2>SkipNav</h2>
				<SkipNavExample />
			</section>
			<section>
				<h2>Slider</h2>
				<SliderExample />
			</section>
			<section>
				<h2>Tabs</h2>
				<TabsExample />
			</section>
			<section>
				<h2>Tooltip</h2>
				<TooltipExample />
			</section>
			<section>
				<h2>VisuallyHidden</h2>
				<VisuallyHiddenExample />
			</section>
			<section>
				<h2>WindowSize</h2>
				<WindowSizeExample />
			</section>
		</div>
	);
}

function PortalExample() {
	return (
		<div
			style={{
				height: 40,
				overflow: "auto",
			}}
		>
			<div style={{ border: "solid 5px", padding: 20, marginLeft: 170 }}>
				This is in the normal react root, with an overflow hidden parent, clips
				the box.
			</div>
			<Portal>
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 20,
						width: 100,
						border: "solid 5px",
						padding: 20,
						background: "#f0f0f0",
					}}
				>
					This is in the portal, rendered in the DOM at the document root so the
					CSS doesn't screw things up, but we render it in the react hierarchy
					where it makes sense.
				</div>
			</Portal>
		</div>
	);
}

function RectExample() {
	return (
		<Rect>
			{({ ref, rect }) => (
				<div>
					<pre>{JSON.stringify(rect, null, 2)}</pre>
					<textarea defaultValue="resize this" />
					<span
						ref={ref}
						contentEditable
						dangerouslySetInnerHTML={{
							__html: "Observing my rect, I'm also editable",
						}}
						style={{
							display: "inline-block",
							padding: 10,
							margin: 10,
							border: "solid 1px",
							background: "#f0f0f0",
						}}
					/>
				</div>
			)}
		</Rect>
	);
}

function SkipNavExample() {
	return (
		<div>
			<SkipNavLink>Skip Nav</SkipNavLink>
			<div>
				<header>
					<ul>
						<li>
							<a href="/location">Location</a>
						</li>
						<li>
							<a href="/about">About</a>
						</li>
					</ul>
				</header>
				<SkipNavContent />
				<div>
					<h3>Welcome to the good stuff!</h3>
					<button onClick={action("Focus click")}>Focus me</button>
				</div>
			</div>
		</div>
	);
}

function SliderExample() {
	return (
		<Slider id="gee-whiz">
			<SliderMarker value={10}>
				<span>10</span>
			</SliderMarker>
			<SliderMarker value={90}>
				<span>90</span>
			</SliderMarker>
		</Slider>
	);
}

function TabsExample() {
	return (
		<div>
			<Tabs>
				<TabList>
					<Tab index={0}>One</Tab>
					<Tab index={1}>Two</Tab>
					<Tab index={2}>Three</Tab>
				</TabList>

				<TabPanels>
					<TabPanel index={0}>
						<h1>one!</h1>
						<button>yo</button>
					</TabPanel>
					<TabPanel index={1}>
						<h1>two!</h1>
					</TabPanel>
					<TabPanel index={2}>
						<h1>three!</h1>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</div>
	);
}

function TooltipExample() {
	return (
		<div>
			<Tooltip id="wow" label="Notifications">
				<button style={{ fontSize: 25 }} aria-label="Notifications">
					<span aria-hidden>🔔</span>
				</button>
			</Tooltip>
			<Tooltip label="Settings">
				<button style={{ fontSize: 25 }} aria-label="Settings">
					<span aria-hidden>⚙️</span>
				</button>
			</Tooltip>
			<Tooltip label="Your files are safe with us">
				<button style={{ fontSize: 25 }}>
					<span aria-hidden>💾</span> Save
				</button>
			</Tooltip>

			<div style={{ float: "right" }}>
				<Tooltip label="Notifications" aria-label="3 Notifications">
					<button style={{ fontSize: 25 }} aria-label="3 Notifications">
						<span aria-hidden>🔔</span>
						<span aria-hidden>3</span>
					</button>
				</Tooltip>
			</div>
		</div>
	);
}

function VisuallyHiddenExample() {
	return (
		<button>
			<VisuallyHidden>Save</VisuallyHidden>
			<svg aria-hidden width="32" height="32">
				<path d="M16 18l8-8h-6v-8h-4v8h-6zM23.273 14.727l-2.242 2.242 8.128 3.031-13.158 4.907-13.158-4.907 8.127-3.031-2.242-2.242-8.727 3.273v8l16 6 16-6v-8z" />
			</svg>
		</button>
	);
}

function WindowSizeExample() {
	return (
		<WindowSize>
			{(sizes) => <pre>Window size: {JSON.stringify(sizes, null, 2)}</pre>}
		</WindowSize>
	);
}

//

function useCityMatch(term: string): City[] | null {
	let throttledTerm = useThrottle(term, 100);
	return React.useMemo(
		() =>
			term.trim() === ""
				? null
				: matchSorter(cities, term, {
						keys: [(item) => `${item.city}, ${item.state}`],
				  }),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[throttledTerm]
	);
}

function useThrottle(value: any, limit: number) {
	const [throttledValue, setThrottledValue] = React.useState(value);
	const lastRan = React.useRef(Date.now());

	React.useEffect(() => {
		const handler = window.setTimeout(() => {
			if (Date.now() - lastRan.current >= limit) {
				setThrottledValue(value);
				lastRan.current = Date.now();
			}
		}, limit - (Date.now() - lastRan.current));

		return () => window.clearTimeout(handler);
	}, [value, limit]);

	return throttledValue;
}
