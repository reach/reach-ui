/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ["**/.*"],
	serverDependenciesToBundle: [
		// MDX junk generally
		/^rehype.*/,
		/^remark.*/,
		/^unified.*/,
	],
	// appDirectory: "app",
	// assetsBuildDirectory: "public/build",
	// serverBuildPath: "build/index.js",
	// publicPath: "/build/",
};
