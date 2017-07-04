import React from "react";
import PropTypes from "prop-types";

import MainButton, { GrayButton } from "./MainButton";

const AdminAction = ({
  isCreatingEvent,
  adminMessage,
  ticketsBought,
  handleStartBooking,
  handleDelete,
  handleCreateGoogleEvent
}) => {
  return (
    <div>
      {adminMessage &&
        <div>
          {adminMessage}
        </div>}
      <MainButton onClick={handleStartBooking}>
        {ticketsBought ? "Visa betalningsstatus" : "Alla är med, nu bokar vi!"}
      </MainButton>
      {ticketsBought &&
        <MainButton
          disabled={isCreatingEvent}
          onClick={handleCreateGoogleEvent}
        >
          Skapa google kalender event
        </MainButton>}
      <GrayButton onClick={handleDelete}>Ta bort Besök</GrayButton>
    </div>
  );
};

AdminAction.propTypes = {
  isCreatingEvent: PropTypes.bool,
  adminMessage: PropTypes.string,
  ticketsBought: PropTypes.bool.isRequired,
  handleStartBooking: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleCreateGoogleEvent: PropTypes.func.isRequired
};

export default AdminAction;
