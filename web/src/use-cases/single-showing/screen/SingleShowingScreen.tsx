import React from "react";
import { useParams } from "react-router";
import SingleShowingContainer from "../containers/SingleShowingContainer";

const SingleShowingScreen = () => {
  const { webId } = useParams<{ webId: string }>();

  return <SingleShowingContainer webId={webId} />;
};

export default SingleShowingScreen;
