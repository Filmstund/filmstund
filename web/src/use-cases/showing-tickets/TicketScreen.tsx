import * as React from "react";
import { useParams } from "react-router-dom";
import { TicketContainer } from "./TicketContainer";

const TicketScreen = () => {
  const { webID } = useParams<"webID">();

  return <TicketContainer webID={webID!} />;
};

export default TicketScreen;
