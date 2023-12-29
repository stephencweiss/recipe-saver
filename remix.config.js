const path = require("path");
const { routeExtensions } = require("remix-custom-routes")

/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["routes/**.*", "**/*.test.{ts,tsx}"],
  routes() {
    const appDirectory = path.join(__dirname, "app")
    return routeExtensions(appDirectory)
  },

  serverModuleFormat: "cjs",
  future: {
    v3_fetcherPersist: true,
  },
};
