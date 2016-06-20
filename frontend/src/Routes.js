import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import MovieList from './components/movie-list';
//import NewVisit from './components/new-visit';
import Root from './Root';

const Routes = React.createClass({
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Root}>
          <Route path="movies" component={MovieList}/>
        </Route>
      </Router>
    );
  }
});

export default Routes;
