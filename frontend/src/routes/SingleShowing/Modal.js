import React from "react";
import styled from "styled-components";

const Padding = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  padding: 1em;
  z-index: 2;
`;

const Background = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background-color: white;
  height: 100%;
`;

const Modal = ({ children, ...props }) =>
  <Padding>
    <Background {...props}>
      {children}
    </Background>
  </Padding>;

export default Modal;
