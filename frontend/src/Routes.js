import React from 'react';
import { Route, IndexRoute } from 'react-router';
import ShowingList from './components/showing-list';
import CreateShowing from './components/create-showing';
import Showing from './components/showing';
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
      <IndexRoute component={MovieList}/>
      <Route path="showings" component={ShowingList}/>
      <Route path="showings/create/:sf_id" component={CreateShowing}/>
      <Route path="showings/:id" component={Showing}/>
      <Route path="movies" component={MovieList}/>
      <Route path="user" component={UserProfile}/>
      <Route path="slots" component={SlotPicker}/>
    </Route>
  </Route>
);

export default routes;
