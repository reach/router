import React from "react";
import Spinner from "./Spinner";
import { fetchMovieDetailsJSON, fetchMovieReviewsJSON } from "../api";
import { createFetcher, Placeholder } from "../future";

// --------------------------
// Invididual movie page
// --------------------------
export default function MoviePage(props) {
  return (
    <React.Fragment>
      <MovieDetails id={props.id} />
      <Placeholder delayMs={1000} fallback={<Spinner size="medium" />}>
        <MovieReviews id={props.id} />
      </Placeholder>
    </React.Fragment>
  );
}

// --------------------------
// Invididual movie details
// --------------------------
// ________
// |      |  Moonrise Kingdom
// |      |  🍅 93%
// |      |  86% liked it
// --------------------------

const movieDetailsFetcher = createFetcher(fetchMovieDetailsJSON);

function MovieDetails(props) {
  const movie = movieDetailsFetcher.read(props.id);
  return (
    <div className="MovieDetails">
      <MoviePoster src={movie.poster} />
      <h1>{movie.title}</h1>
      <MovieMetrics {...movie} />
    </div>
  );
}

const imageFetcher = createFetcher(
  src =>
    new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.src = src;
    })
);

function Img({ src, ...rest }) {
  return <img src={imageFetcher.read(src)} {...rest} />;
}

function MoviePoster(props) {
  return (
    <div className="MoviePoster">
      <Placeholder
        delayMs={1500}
        fallback={<img src={props.src} alt="poster" />}
      >
        <Img src={props.src} alt="poster" />
      </Placeholder>
    </div>
  );
}

function MovieMetrics(props) {
  return (
    <React.Fragment>
      <div className="MovieMetrics-tomato">
        <h4>Tomatometer</h4>
        <p>
          {props.fresh ? "🍅" : "🤢"} {props.rating}
        </p>
      </div>
      <div className="MovieMetrics-audience">
        <h4>Audience</h4>
        <p>
          {"🍿"} {props.audience}
        </p>
      </div>
      <div className="MovieMetrics-consensus">
        <h4>Critics Consensus</h4>
        <p>{props.consensus}</p>
      </div>
    </React.Fragment>
  );
}

// ----------------------------
// Invididual movie reviews pane
// ----------------------------
//  __________________________
// | "Good movie" - Dan       |
// |_ ________________________|
// | "Waste of time" - Andrew |
// |__________________________|
// ----------------------------

const movieReviewsFetcher = createFetcher(fetchMovieReviewsJSON);

function MovieReviews(props) {
  const reviews = movieReviewsFetcher.read(props.id);
  return (
    <div className="MovieReviews">
      {reviews.map(review => <MovieReview key={review.id} {...review} />)}
    </div>
  );
}

function MovieReview(props) {
  return (
    <blockquote className="MovieReview">
      <figure>{props.fresh ? "🍅" : "🤢"}</figure>
      <p>{props.text}</p>
      <footer>
        {props.author.name}, {props.author.publication}
      </footer>
    </blockquote>
  );
}
