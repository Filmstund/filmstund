import React from "react";
import styled from "@emotion/styled";
import loading from "../../../assets/loading.gif";
import { ReactComponent as Spinner } from "./Spin.svg";
import StatusMessageBox from "./StatusMessageBox";

const LoadingImage = styled.div<{ src: string }>`
  grid-area: center;
  background-image: url(${(props) => props.src});
  background-repeat: no-repeat;
  background-position: center 20%;
  height: 100%;
  width: 100%;
`;

export const ProjectorLoader = () => {
  return <LoadingImage src={loading} />;
};

export default ProjectorLoader;

const FullPageContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background: var(--main-bg);
  display: grid;
  place-items: center;
`;

export const Loader = () => (
  <FullPageContainer>
    <Spinner color={"#d0021b"} width={100} height={100} />
  </FullPageContainer>
);

export const ErrorScreen = ({ error }: { error: Error }) => (
  <FullPageContainer style={{ background: "#000" }}>
    <StatusMessageBox success={false} errors={error.message} />
  </FullPageContainer>
);
