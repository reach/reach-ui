import * as React from "react";
import cx from "clsx";
import styles from "./Note.module.scss";

export function Note(props) {
  return <div {...props} className={cx(props.className, styles.Note)} />;
}
