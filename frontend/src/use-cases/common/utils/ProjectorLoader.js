import React from "react";
import styled from "styled-components";
import loading from "../../../assets/loading.gif";

const ratioWidth = 150 / 96;

const LoadingImage = styled.div`
  background-image: url(${props => props.src});
  background-size: cover;
  height: ${props => props.height}px;
  width: ${props => props.width}px;
  margin: 0 auto;
`;

const ProjectorLoader = ({ height = 96 }) => {
  let width = 150;
  if (height !== 96) {
    width = height * ratioWidth;
  }

  return (
    <span>
      <LoadingImage src={loading} height={height} width={width} />
    </span>
  );
};

export default ProjectorLoader;
