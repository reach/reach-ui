import * as React from "react";
import { action } from "@storybook/addon-actions";
import {
	Menu,
	MenuList,
	MenuButton,
	MenuLink,
	MenuItem,
} from "@reach/menu-button";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "@reach/menu-button/styles.css";

let name = "With React Router Links + Styled Components";

function Example() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/settings" element={<Settings />} />
			</Routes>
		</Router>
	);
}

Example.storyName = name;
export { Example };

////////////////////////////////////////////////////////////////////////////////

function Home() {
	return (
		<div>
			<h2>Home</h2>
			<Menu>
				<MenuButton>
					Actions <span aria-hidden="true">▾</span>
				</MenuButton>
				<MenuList>
					<MenuItem onSelect={action("Mark as Draft")}>Mark as Draft</MenuItem>
					<MenuLink as={Link} to="/settings">
						View Settings
					</MenuLink>
					<MenuItem onSelect={action("Delete")}>Delete</MenuItem>
				</MenuList>
			</Menu>
		</div>
	);
}

function Settings() {
	return (
		<div>
			<h2>Settings</h2>
			<p>
				<Link to="/">Go Home</Link>
			</p>
		</div>
	);
}
