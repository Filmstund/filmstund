import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  MarkShowingAsBought,
  MarkShowingAsBoughtVariables,
} from "./__generated__/MarkShowingAsBought";

const markAsBoughtMutation = gql`
  mutation MarkShowingAsBought($showingId: UUID!, $price: SEK!) {
    markAsBought(showingId: $showingId, price: $price) {
      id
      ticketsBought
      price
      private
      payToUser {
        id
      }
      expectedBuyDate
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
        participantPaymentInfos {
          id
          hasPaid
          amountOwed
          user {
            id
            nick
            name
            phone
          }
        }
      }
    }
  }
`;

export const useMarkAsBought = () =>
  useMutation<MarkShowingAsBought, MarkShowingAsBoughtVariables>(
    markAsBoughtMutation,
    {
      refetchQueries: ["ShowingsQuery"],
    }
  );
