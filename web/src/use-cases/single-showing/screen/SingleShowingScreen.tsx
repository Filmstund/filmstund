import React from "react";
import { useParams } from "react-router-dom";
import SingleShowingContainer from "../containers/SingleShowingContainer";

const SingleShowingScreen = () => {
  const { webID } = useParams<"webID">();

  return <SingleShowingContainer webID={webID!} />;
};

export default SingleShowingScreen;
