import React from "react";
import { useParams } from "react-router-dom";
import EditShowingForm from "./EditShowingForm";

const EditShowingFormScreen = () => {
  const { webID } = useParams<"webID">();

  return <EditShowingForm webID={webID!} />;
};

export default EditShowingFormScreen;
