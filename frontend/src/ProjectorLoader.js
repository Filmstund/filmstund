
import React from "react"
import styled from "styled-components";
import loading from "./assets/loading.gif";


const ratioHeight = 96/150;
const ratioWidth = 150/96;

const LoadingImage = styled.div`
    background-image: url(${props => props.src});
    background-size: cover;
    height: ${props => props.height};
    width: ${props => props.width};    
    margin: 0 auto;
`;


const ProjectorLoader = ({height = '96px', width = '150px'}) => {

  if(height !== '96px') {
    width = (parseInt(height.replace('px', '')) * ratioWidth) + 'px';
  } else if (width !== '96px') {
    height = (parseInt(width.replace('px', '')) * ratioHeight) + 'px';
  } 
  
  return (<span >
      <LoadingImage src={loading} height={height} width={width} />
    </span>)

}


export default ProjectorLoader