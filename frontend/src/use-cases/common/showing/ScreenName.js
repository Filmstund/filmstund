import React from "react";

export const ScreenName = ({ ticket }) => {
  if (!ticket) {
    return null;
  }

  return (
    <div>
      {ticket.cinema.replace(/ ?Filmstaden ?/, "")}, {ticket.screen}
    </div>
  );
};
