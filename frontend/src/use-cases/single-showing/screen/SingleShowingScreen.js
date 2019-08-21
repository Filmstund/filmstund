import React from "react";
import { withRouter } from "react-router";
import SingleShowingContainer from "../containers/SingleShowingContainer";

const SingleShowingScreen = ({ match, history }) => {
  const { webId } = match.params;

  return <SingleShowingContainer webId={webId} history={history} />;
};

export default withRouter(SingleShowingScreen);
