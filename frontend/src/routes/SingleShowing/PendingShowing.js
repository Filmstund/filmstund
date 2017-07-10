import React from "react";
import { connect } from "react-redux";

import { showings as showingActions } from "../../store/reducers";

import MainButton, { GrayButton } from "../../MainButton";
import buildUserComponent from "./UserComponentBuilder";
import ParticipantList from "./ParticipantsList";


const PendingShowing = ({
  showing,
  isParticipating,
  handleAttend,
  handleUnattend
}) =>
  <div>
    {!isParticipating &&
      <MainButton onClick={handleAttend}>Jag hänger på!</MainButton>}
    {isParticipating && <GrayButton onClick={handleUnattend}>Avanmäl</GrayButton>}
    <ParticipantList participants={showing.participants} />
  </div>;

const mapDispatchToProps = (dispatch, props) => {
  const { requestAttend, requestUnattend } = showingActions.actions;
  const { showing } = props;

  return {
    handleAttend: () => dispatch(requestAttend(showing.id)),
    handleUnattend: () => dispatch(requestUnattend(showing.id))
  };
};

export default connect(null, mapDispatchToProps)(PendingShowing);
