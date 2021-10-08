import React from "react";
import { useParams } from "react-router-dom";
import SingleShowingContainer from "../containers/SingleShowingContainer";

const SingleShowingScreen = () => {
  const { webId } = useParams<"webId">();

  return <SingleShowingContainer webId={webId!} />;
};

export default SingleShowingScreen;
