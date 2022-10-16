import * as React from "react";
import cx from "clsx";

export function Note(props) {
	return <div {...props} className={cx(props.className, "Note")} />;
}
