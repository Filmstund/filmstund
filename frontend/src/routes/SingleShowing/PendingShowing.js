import React from "react";
import { connect } from "react-redux";
import styled from "styled-components";

import { showings as showingActions } from "../../store/reducers";

import MainButton, { GrayButton } from "../../MainButton";
import ParticipantList from "./ParticipantsList";

const ButtonContainer = styled.div`
      display: flex;
      flex-wrap: wrap;
      justify-content: space-around;
    `;

const PendingShowing = ({
  showing,
  isParticipating,
  handleAttend,
  handleUnattend
}) =>
  <ButtonContainer>
    {!isParticipating &&
      <MainButton onClick={handleAttend}>Jag hänger på!</MainButton>}
    {isParticipating &&
      <GrayButton onClick={handleUnattend}>Avanmäl</GrayButton>}
    <ParticipantList participants={showing.participants} />
  </ButtonContainer>;

const mapDispatchToProps = (dispatch, props) => {
  const { requestAttend, requestUnattend } = showingActions.actions;
  const { showing } = props;

  return {
    handleAttend: () => dispatch(requestAttend(showing.id)),
    handleUnattend: () => dispatch(requestUnattend(showing.id))
  };
};

export default connect(null, mapDispatchToProps)(PendingShowing);
