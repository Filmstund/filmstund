import { gql, useQuery } from "@apollo/client";
import * as React from "react";
import { ticketFragment } from "../../apollo/mutations/useAddTickets";
import { useParams } from "react-router-dom";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import { TicketQuery, TicketQueryVariables } from "./__generated__/TicketQuery";
import { TicketContainer } from "./TicketContainer";

const useTickets = (webId: string) =>
  useQuery<TicketQuery, TicketQueryVariables>(
    gql`
      query TicketQuery($webId: Base64ID!) {
        me: currentUser {
          id
        }
        showing(webId: $webId) {
          ...Ticket
        }
      }
      ${ticketFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
      variables: { webId },
    }
  );

const TicketScreen = () => {
  const { webId } = useParams<{ webId: string }>();

  const { data } = useTickets(webId);

  if (!data || !data.me || !data.showing) {
    return <Loader />;
  } else {
    return <TicketContainer showing={data.showing} me={data.me} />;
  }
};

export default TicketScreen;
