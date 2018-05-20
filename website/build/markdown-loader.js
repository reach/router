const markdownIt = require("markdown-it");
const Prism = require("prismjs");

let aliases = {
  js: "jsx",
  html: "markup",
  sh: "bash"
};

let highlight = (str, lang) => {
  if (!lang) {
    return str;
  } else {
    lang = aliases[lang] || lang;
    require(`prismjs/components/prism-${lang}.js`);
    if (Prism.languages[lang]) {
      return Prism.highlight(str, Prism.languages[lang]);
    } else {
      return str;
    }
  }
};

let md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight
});

module.exports = markdown =>`
import React from 'react'
export default function() {
  return React.createElement(
    'div',
    {
      dangerouslySetInnerHTML: { __html: ${JSON.stringify(md.render(markdown))}}
    }
  )
}
`

