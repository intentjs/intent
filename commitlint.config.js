const Configuration = {
  /*
   * Resolve and load @commitlint/config-conventional from node_modules.
   * Referenced packages must be installed
   */
  extends: ["@commitlint/config-conventional"],

  // Add custom rules
  rules: {
    // Increase max line length (default is 100)
    "body-max-line-length": [2, "always", 200],
    // Increase header length (default is 100)
    "header-max-length": [2, "always", 100],
  },
};

module.exports = Configuration;
