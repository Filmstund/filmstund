import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import TopBar from "./TopBar";
import Container from "./Container";
import Home from "./routes/Home";
import Showings from "./routes/Showings";
import User from "./routes/User";

const App = React.createClass({
  render() {
    return (
      <Router>
        <Container>
          <TopBar/>
          <Route exact path="/" component={Home} />
          <Route path="/showings" component={Showings} />
          <Route path="/user" component={User} />
        </Container>
      </Router>
    );
  }
});

export default App
