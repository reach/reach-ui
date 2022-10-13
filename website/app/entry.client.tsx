import * as ReactDOM from "react-dom";
import { StrictMode } from "react";
import { RemixBrowser } from "@remix-run/react";

// @ts-expect-error
if (window.__env && window.__env.NODE_ENV === "development") {
	ReactDOM.hydrate(
		<StrictMode>
			<RemixBrowser />
		</StrictMode>,
		document
	);
} else {
	ReactDOM.hydrate(<RemixBrowser />, document);
}
