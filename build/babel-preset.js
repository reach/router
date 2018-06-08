const BABEL_ENV = process.env.BABEL_ENV;
const building = BABEL_ENV != undefined && BABEL_ENV !== "cjs";

const plugins = [
  "transform-class-properties",
  "transform-object-rest-spread",
  "dev-expression",
  [
    "transform-react-remove-prop-types",
    {
      mode: "unsafe-wrap"
    }
  ],
  [
    "transform-inline-environment-variables",
    {
      include: ["COMPAT"]
    }
  ]
];

if (BABEL_ENV === "umd") {
  plugins.push("external-helpers");
}

module.exports = {
  presets: [
    [
      "env",
      {
        loose: true,
        modules: building ? false : "commonjs"
      }
    ],
    "react"
  ],
  plugins: plugins
};
