import React from 'react';
import { Route, IndexRoute } from 'react-router';
import ShowingList from './components/showing-list';
import MovieList from './components/movie-list';
import UserProfile from './components/user-profile';
import SlotPicker from './components/slot-picker';
import Start from './components/start';
//import NewVisit from './components/new-visit';
import Root from './Root';
import App from './App';


const routes = (
  <Route path="/" component={Root}>
    <Route path="start" component={Start}/>
    <Route path="/" component={App}>
      <Route path="showings" component={ShowingList}/>
      <Route path="movies" component={MovieList}/>
      <Route path="user" component={UserProfile}/>
      <Route path="slots" component={SlotPicker}/>
    </Route>
  </Route>
);

export default routes;
