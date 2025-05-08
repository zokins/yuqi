/* eslint-disable */

export default {
  displayName: "yuqijs-vue-query",
  preset: "../../../jest.preset.js",
  transform: {
    "^.+\\.[tj]s$": ["@swc/jest"],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../../coverage/libs/yuqijs/vue-query",
};
