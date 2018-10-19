import React from "react";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import MainButton from "../../use-cases/common/ui/MainButton";
import gql from "graphql-tag";

const PayToUser = ({ user }) => (
  <span>
    <strong>{user.phone}</strong> ({user.firstName} '{user.nick}'{" "}
    {user.lastName})
  </span>
);

const BoughtShowing = ({
  isAdmin,
  attendeePaymentDetails,
  myTickets,
  onClickTickets,
  openSwish
}) => {
  if (!attendeePaymentDetails) {
    return <Loader />;
  }

  const { amountOwed, swishLink, hasPaid, payTo } = attendeePaymentDetails;

  const openSwishLink = () => openSwish(swishLink);

  return (
    <React.Fragment>
      {(isAdmin || myTickets.length > 0) && (
        <MainButton onClick={onClickTickets}>Mina biljetter</MainButton>
      )}
      {!hasPaid && (
        <div>
          Betala <strong>{amountOwed / 100} kr</strong> till{" "}
          <PayToUser user={payTo} />
          <MainButton onClick={openSwishLink}>Öppna Swish</MainButton>
        </div>
      )}
    </React.Fragment>
  );
};

BoughtShowing.fragments = {
  showing: gql`
    fragment BoughtShowing on Showing {
      myTickets {
        id
      }
      attendeePaymentDetails {
        amountOwed
        swishLink
        hasPaid
        payTo {
          id
          phone
          firstName
          nick
          lastName
        }
      }
    }
  `
};

export default BoughtShowing;
