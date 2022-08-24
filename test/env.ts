let reactVersion = 17;
if (process.env.USE_REACT_16 === "true") {
	reactVersion = 16;
} else if (process.env.USE_REACT_18 === "true") {
	reactVersion = 18;
}

export { reactVersion };
