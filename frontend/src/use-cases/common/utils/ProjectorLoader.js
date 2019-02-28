import React from "react";
import styled from "@emotion/styled";
import loading from "../../../assets/loading.gif";

const LoadingImage = styled.div`
  grid-area: center;
  background-image: url(${props => props.src});
  background-repeat: no-repeat;
  background-position: center 20%;
  height: 100%;
  width: 100%;
`;

const ProjectorLoader = () => {
  return <LoadingImage src={loading} />;
};

export default ProjectorLoader;
