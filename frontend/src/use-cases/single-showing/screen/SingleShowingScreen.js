import React from "react";
import { compose } from "recompose";
import { withRouter } from "react-router";
import SingleShowingContainer from "../containers/SingleShowingContainer";

const SingleShowingScreen = ({ match, history }) => {
  const { webId } = match.params;

  return <SingleShowingContainer webId={webId} history={history} />;
};

export default compose(withRouter)(SingleShowingScreen);
