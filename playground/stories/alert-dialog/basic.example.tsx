import * as React from "react";
import {
	AlertDialog,
	AlertDialogLabel,
	AlertDialogDescription,
} from "@reach/alert-dialog";
import type { AlertDialogStory, AlertDialogStoryArgs } from "./index.story.js";

function Example(args: AlertDialogStoryArgs) {
	const close = React.useRef(null);
	const [showDialog, setShowDialog] = React.useState(false);
	return (
		<div>
			<button onClick={() => setShowDialog(true)}>Show Dialog</button>
			{showDialog && (
				<AlertDialog leastDestructiveRef={close} id="great-work">
					<AlertDialogLabel>Confirmation!</AlertDialogLabel>
					<AlertDialogDescription>
						Are you sure you want to have that milkshake?
					</AlertDialogDescription>
					<p>
						<button>DESTROY Stuff!</button>{" "}
						<button ref={close} onClick={() => setShowDialog(false)}>
							Cancel
						</button>
					</p>
				</AlertDialog>
			)}
		</div>
	);
}

const story: AlertDialogStory = {
	render: Example,
	name: "Basic",
};
export default story;
