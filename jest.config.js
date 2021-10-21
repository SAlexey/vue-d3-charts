module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  transform: {
    "^.+\\.vue$": "vue-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!d3-(selection|transition|scale))",
  ],
};
