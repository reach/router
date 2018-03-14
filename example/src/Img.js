import React from "react";
import { SimpleCache, createResource } from "simple-cache-provider";
import withCache from "./withCache";

function loadImage(src) {
  const image = new Image();
  return new Promise(resolve => {
    image.onload = () => resolve(src);
    image.src = src;
  });
}

const readImage = createResource(loadImage);

function Img({ cache, src, ...props }) {
  return <img src={readImage(cache, src)} {...props} />;
}

export default withCache(Img);
