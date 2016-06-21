import React from 'react';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import MovieList from './components/movie-list';
import UserProfile from './components/user-profile';
//import NewVisit from './components/new-visit';
import Root from './Root';

const Routes = React.createClass({
  render() {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={Root}>
          <IndexRoute component={MovieList}/>
          <Route path="showings" component={MovieList}/>
          <Route path="movies" component={MovieList}/>
          <Route path="user" component={UserProfile}/>
        </Route>
      </Router>
    );
  }
});

export default Routes;
