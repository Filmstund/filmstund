
import React from "react"
import styled from "styled-components";
import loading from "./assets/loading.gif";

const LoadingImage = styled.div`
    background-image: url(${props => props.src});
    background-size: cover;
    height: 96px;
    width: 150px;    
    margin: 0 auto;
`;

const ProjectorLoader = () => (<div >
  <LoadingImage src={loading} />
</div>)


export default ProjectorLoader