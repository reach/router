import React, { PureComponent } from "react";
import Spinner from "./Spinner";
import MovieListPage from "./MovieListPage";
import { Placeholder, Loading, createFetcher } from "../future";
import { Router, Link } from "@reach/router";

const moviePageFetcher = createFetcher(() => import("./MoviePage"));

function MoviePageLoader(props) {
  const MoviePage = moviePageFetcher.read().default;
  return <MoviePage {...props} />;
}

class Master extends PureComponent {
  state = {
    loadingId: null
  };

  handleMovieClick = loadingId => {
    this.setState({ loadingId });
  };

  render() {
    const { loadingId } = this.state;
    return (
      <Loading>
        {isLoading => (
          <Placeholder delayMs={1500} fallback={<Spinner size="large" />}>
            <MovieListPage
              loadingId={loadingId}
              onMovieClick={this.handleMovieClick}
            />
          </Placeholder>
        )}
      </Loading>
    );
  }
}

class Detail extends PureComponent {
  render() {
    return (
      <Placeholder delayMs={2000} fallback={<Spinner size="large" />}>
        <MoviePageLoader id={this.props.movieId} />
      </Placeholder>
    );
  }
}

class App extends PureComponent {
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location !== this.props.location) {
      window.scrollTo(0, 0);
    }
  }

  render() {
    return <div className="App">{this.props.children}</div>;
  }
}

export default () => (
  <Router>
    <App path="/">
      <Master path="/" />
      <Detail path=":movieId" />
    </App>
  </Router>
);
