import * as React from "react";
import "@reach/accordion/styles.css";
import {
	Accordion,
	AccordionItem,
	AccordionButton,
	AccordionPanel,
} from "@reach/accordion";
import styles from "./with-arrows.module.css";
import cx from "clsx";

let name = "With Arrows";

function Example() {
	const [activeItem, setActiveItem] = React.useState<number | undefined>();
	return (
		<Accordion index={activeItem} onChange={(index) => setActiveItem(index)}>
			<AccordionItem className={styles.item}>
				<ArrowButton active={activeItem === 0}>ABCs</ArrowButton>
				<AccordionPanel className={styles.panel}>
					Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
					pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
					congue gravida malesuada proin scelerisque luctus est convallis.
				</AccordionPanel>
			</AccordionItem>
			<AccordionItem className={styles.item}>
				<ArrowButton active={activeItem === 1}>Easy As</ArrowButton>
				<AccordionPanel className={styles.panel}>
					Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
					pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
					congue gravida malesuada proin scelerisque luctus est convallis.
				</AccordionPanel>
			</AccordionItem>
			<AccordionItem className={styles.item}>
				<ArrowButton active={activeItem === 2}>123s</ArrowButton>
				<AccordionPanel className={styles.panel}>
					Ante rhoncus facilisis iaculis nostra faucibus vehicula ac consectetur
					pretium, lacus nunc consequat id viverra facilisi ligula eleifend,
					congue gravida malesuada proin scelerisque luctus est convallis.
				</AccordionPanel>
			</AccordionItem>
		</Accordion>
	);
}

Example.storyName = name;
export { Example };

function ArrowButton({ children, active, ...props }: ArrowButtonProps) {
	return (
		<div className={styles.header} {...props}>
			<div className={styles.headerInner}>
				<h3 className={styles.heading}>
					<AccordionButton className={styles.button}>
						{children}
					</AccordionButton>
				</h3>
				<div className={styles.arrowWrapper}>
					<ArrowIcon active={active} aria-hidden />
				</div>
			</div>
		</div>
	);
}

function ArrowIcon({ active, ...props }: ArrowIconProps) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 451.847 451.847"
			className={cx(styles.icon, active && styles.active)}
			{...props}
		>
			<path
				d="M225.923,354.706c-8.098,0-16.195-3.092-22.369-9.263L9.27,151.157c-12.359-12.359-12.359-32.397,0-44.751
		c12.354-12.354,32.388-12.354,44.748,0l171.905,171.915l171.906-171.909c12.359-12.354,32.391-12.354,44.744,0
		c12.365,12.354,12.365,32.392,0,44.751L248.292,345.449C242.115,351.621,234.018,354.706,225.923,354.706z"
			/>
		</svg>
	);
}

type ArrowButtonProps = React.ComponentPropsWithoutRef<"div"> & {
	active: boolean;
};

type ArrowIconProps = React.ComponentPropsWithoutRef<"svg"> & {
	active: boolean;
};
