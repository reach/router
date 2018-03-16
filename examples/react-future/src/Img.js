/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import { createResource } from "simple-cache-provider";
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

export const preload = readImage.preload;

export default withCache(Img);
