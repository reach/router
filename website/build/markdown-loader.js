const markdownIt = require("markdown-it");
const Prism = require("prismjs");
const cheerio = require("cheerio");

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

let getTitle = html =>
  cheerio
    .load(html)("h1")
    .text();

module.exports = markdown => {
  let html = md.render(markdown);
  return `
import React from 'react'
export const title = ${JSON.stringify(getTitle(html))};
export default function() {
  return React.createElement(
    'div',
    {
      className: 'markdown',
      dangerouslySetInnerHTML: { __html: ${JSON.stringify(html)}}
    }
  )
}
`;
};
