import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";
import replace from "rollup-plugin-replace";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import filesize from "rollup-plugin-filesize";

import pkg from "./package.json";

const dependencies = Object.keys(pkg.dependencies);
const peerDependencies = Object.keys(pkg.peerDependencies);

const input = "src/index.js";
const umdConfig = {
  name: "ReachRouter",
  format: "umd",
  globals: {
    react: "React",
    "react-dom": "ReactDOM"
  }
};

const basePlugins = [
  babel({
    exclude: "node_modules/**"
  }),
  filesize()
];

const umdPlugins = [
  ...basePlugins,
  resolve(),
  commonjs({
    include: /node_modules/
  }),
  replace({
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
  })
];

export default [
  {
    input,
    output: {
      file: pkg.main,
      format: "cjs"
    },
    external: [...dependencies, ...peerDependencies],
    plugins: basePlugins
  },
  {
    input,
    output: {
      file: pkg.module,
      format: "es"
    },
    external: [...dependencies, ...peerDependencies],
    plugins: basePlugins
  },
  {
    input,
    output: {
      file: "umd/reach-router.js",
      ...umdConfig
    },
    external: peerDependencies,
    plugins: umdPlugins
  },
  {
    input,
    output: {
      file: "umd/reach-router.min.js",
      ...umdConfig
    },
    external: peerDependencies,
    plugins: [...umdPlugins, uglify()]
  }
];
