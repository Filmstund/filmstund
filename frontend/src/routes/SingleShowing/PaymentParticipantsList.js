import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Header from "../../Header";

import { groupBy } from "lodash";

import withUserLoader from "../../loaders/UserLoader";

const UserActiveStatus = styled.div`
  color: ${props => (props.active ? "#000" : "#ccc")};
`;

const UserWithPriceItem = withUserLoader(
  ({ user, active, price, onPaidChange, hasPaid }) =>
    <UserActiveStatus active={active}>
      {user.nick || user.name}{" "}
      <label>
        har betalat:{" "}
        <input type="checkbox" checked={hasPaid} onChange={onPaidChange} />
      </label>
    </UserActiveStatus>
);

const renderUserWithPriceItem = (info, handlePaidChange, active) => (
  <UserWithPriceItem
    key={info.id}
    active={active}
    userId={info.userId}
    onPaidChange={() => handlePaidChange(info)}
    price={info.amountOwed}
    hasPaid={info.hasPaid}
  />
)

const PaymentParticipantsList = ({ handlePaidChange, participants }) => {
  const { hasPaid = [], hasNotPaid = [] } = groupBy(
    participants,
    info => (info.hasPaid ? "hasPaid" : "hasNotPaid")
  );

  return (
    <div>
      <Header>Deltagare</Header>
      {hasNotPaid.length === 0 && "Alla har betalat!"}
      {hasNotPaid.map(info => renderUserWithPriceItem(info, () => handlePaidChange(info), true))}
      <hr />
      {hasPaid.map(info => renderUserWithPriceItem(info, () => handlePaidChange(info), false))}
    </div>
  );
};

PaymentParticipantsList.propTypes = {
  handlePaidChange: PropTypes.func.isRequired,
  participants: PropTypes.array.isRequired
};

export default PaymentParticipantsList;
