import gql from "graphql-tag";
import { useMutation } from "react-apollo";
import {
  MarkShowingAsBought,
  MarkShowingAsBoughtVariables
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

export const useMarkAsBought = () => {
  const [mutate] = useMutation<
    MarkShowingAsBought,
    MarkShowingAsBoughtVariables
  >(markAsBoughtMutation);

  return (showingId: string, price: number) =>
    mutate({
      variables: { showingId, price },
      refetchQueries: ["ShowingsQuery"]
    });
};
