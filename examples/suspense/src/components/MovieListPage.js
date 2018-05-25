import React, { PureComponent } from "react";
import ReactDOM from "react-dom";
import Spinner from "./Spinner";
import { fetchMovieListJSON } from "../api";
import { createFetcher } from "../future";
import { Link } from "@reach/router";

const movieListFetcher = createFetcher(fetchMovieListJSON);

// --------------------------
// Movie list page
// --------------------------
//
// Top Box Office
// - 🍅 97% Black Panther
// - 🤢 58% Peter Rabbit
// - 🤢 12% Fifty Shades Freed
// --------------------------

export default function MovieListPage(props) {
  return (
    <React.Fragment>
      <h1 className="MovieListPage-header">Top Box Office {"🍿"}</h1>
      <div className="MovieListPage-list">
        {movieListFetcher
          .read()
          .map(movie => (
            <MovieListItem
              key={movie.id}
              {...movie}
              onClick={() => props.onMovieClick(movie.id)}
              isLoading={props.loadingId && movie.id === props.loadingId}
            />
          ))}
      </div>
    </React.Fragment>
  );
}

class DelayedSpinner extends React.Component {
  state = { spin: false };
  componentDidMount() {
    this.timeout = setTimeout(() => {
      ReactDOM.flushSync(() => this.setState({ spin: true }));
    }, 400);
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  render() {
    return this.state.spin ? <Spinner size={this.props.size} /> : null;
  }
}

function MovieListItem(props) {
  const opacity = props.isLoading === false ? 0.5 : 1;
  return (
    <Link
      className="MovieListItem"
      to={props.id + ""}
      onClick={props.onClick}
      style={{ opacity }}
    >
      <div className="MovieListItem-freshness">{props.fresh ? "🍅" : "🤢"}</div>
      <span className="MovieListItem-title">{props.title}</span>
      <span className="MovieListItem-meta">
        {props.rating} &middot; {props.gross}
      </span>
      <div className="MovieListItem-action">
        {props.isLoading ? (
          <DelayedSpinner size="small" />
        ) : (
          <span className="MovieListItem-more">{"👉"}</span>
        )}
      </div>
    </Link>
  );
}
