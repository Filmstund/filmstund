import { gql, useQuery } from "@apollo/client";
import * as React from "react";
import { ticketFragment } from "../../apollo/mutations/useAddTickets";
import { useParams } from "react-router-dom";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import {
  TicketQueryQuery,
  TicketQueryQueryVariables,
} from "../../__generated__/types";
import { TicketContainer } from "./TicketContainer";

const useTickets = (webID: string) =>
  useQuery<TicketQueryQuery, TicketQueryQueryVariables>(
    gql`
      query TicketQuery($webID: Base64ID!) {
        me: currentUser {
          id
        }
        showing(webID: $webID) {
          ...Ticket
        }
      }
      ${ticketFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
      variables: { webID },
    }
  );

const TicketScreen = () => {
  const { webID } = useParams<"webID">();

  const { data } = useTickets(webID!);

  if (!data || !data.me || !data.showing) {
    return <Loader />;
  } else {
    return <TicketContainer showing={data.showing} me={data.me} />;
  }
};

export default TicketScreen;
