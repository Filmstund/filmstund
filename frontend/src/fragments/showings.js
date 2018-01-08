import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { wrapMutate } from "../store/apollo";

export const markAsBought = graphql(
  gql`
    mutation MarkShowingAsBought(
      $showingId: UUID!
      $showing: UpdateShowingInput
      $ticketUrls: [String!]
    ) {
      updateShowing(showingId: $showingId, newValues: $showing) {
        id
      }

      markAsBought(showingId: $showingId) {
        id
      }
      processTicketUrls(showingId: $showingId, ticketUrls: $ticketUrls) {
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
  `,
  {
    props: ({ mutate, ownProps: { showing: { id: showingId } } }) => ({
      markShowingBought: ({ showing, ticketUrls }) =>
        wrapMutate(mutate, { showing, showingId, ticketUrls })
    })
  }
);

export const deleteShowing = graphql(
  gql`
    mutation DeleteShowing($showingId: UUID!) {
      deleteShowing(showingId: $showingId) {
        id
      }
    }
  `,
  {
    props: ({ mutate, ownProps: { showing: { id: showingId } } }) => ({
      deleteShowing: () => wrapMutate(mutate, { showingId })
    }),
    options: {
      refetchQueries: ["ShowingsQuery"]
    }
  }
);

export const togglePaidChange = graphql(
  gql`
    mutation TogglePaidChange($paymentInfo: ParticipantPaymentInput!) {
      updateParticipantPaymentInfo(paymentInfo: $paymentInfo) {
        id
        hasPaid
      }
    }
  `,
  {
    props: ({ mutate }) => ({
      togglePaidChange: paymentInfo => wrapMutate(mutate, { paymentInfo })
    }),
    options: {
      refetchQueries: ["ShowingsQuery"]
    }
  }
);
