import * as React from "react";
import {
	DialogInner,
	unstable_DialogWrapper as DialogWrapper,
	DialogContent,
} from "@reach/dialog";
import "@reach/dialog/styles.css";

const name = "Custom Portal Node";

function Example() {
	let [showDialog, setShowDialog] = React.useState(false);
	let portalContainerRef = React.useRef<HTMLDivElement>(null);
	return (
		<div
			ref={portalContainerRef}
			style={{
				position: "relative",
				padding: 30,
				minHeight: "max(60vh, 400px)",
			}}
		>
			<button onClick={() => setShowDialog(true)}>Show Dialog</button>
			{showDialog ? (
				<DialogWrapper isOpen containerRef={portalContainerRef}>
					<DialogInner
						aria-label="Announcement"
						onDismiss={() => setShowDialog(false)}
						allowPinchZoom
						style={{
							background: "hsla(0, 0%, 0%, 0.33)",
							position: "absolute",
							top: 0,
							right: 0,
							bottom: 0,
							left: 0,
							overflow: "auto",
						}}
					>
						<DialogContent>
							<button onClick={() => setShowDialog(false)}>Close Dialog</button>
							<p>This is killer!</p>
							<input type="text" />
							<br />
							<input type="text" />
							<button>Ayyyyyy</button>
						</DialogContent>
					</DialogInner>
				</DialogWrapper>
			) : null}
		</div>
	);
}

Example.storyName = name;
export { Example };
