import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import {
  MarkShowingAsBoughtMutation,
  MarkShowingAsBoughtMutationVariables,
} from "../../../__generated__/types";

const markAsBoughtMutation = gql`
  mutation MarkShowingAsBought($showingId: UUID!, $price: SEK!) {
    markAsBought(showingID: $showingId, price: $price) {
      id
      ticketsBought
      price
      private
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
          userID
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
  useMutation<
    MarkShowingAsBoughtMutation,
    MarkShowingAsBoughtMutationVariables
  >(markAsBoughtMutation, {
    refetchQueries: ["ShowingsQuery"],
  });
