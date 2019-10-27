import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import {
  MarkShowingAsBought,
  MarkShowingAsBoughtVariables
} from "./__generated__/MarkShowingAsBought";

const markAsBoughtMutation = gql`
  mutation MarkShowingAsBought($showingId: ShowingID!, $price: SEK!) {
    markAsBought(showingId: $showingId, price: $price) {
      id
      ticketsBought
      price
      payToUser {
        id
      }
      date
      time
      myTickets {
        id
      }
      attendeePaymentDetails {
        payTo {
          id
          nick
          firstName
          lastName
          phone
        }
        swishLink
        hasPaid
        amountOwed
      }
      adminPaymentDetails {
        attendees {
          userId
          type
          hasPaid
          amountOwed
        }
      }
    }
  }
`;

export const useMarkAsBought = () =>
  useMutation<MarkShowingAsBought, MarkShowingAsBoughtVariables>(
    markAsBoughtMutation,
    {
      refetchQueries: ["ShowingsQuery"]
    }
  );
