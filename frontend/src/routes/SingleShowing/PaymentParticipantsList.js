import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import Header from "../../Header";

import { groupBy } from "lodash";

import buildUserComponent from "./UserComponentBuilder";

const UserActiveStatus = styled.div`
  color: ${props => (props.active ? "#000" : "#ccc")};
`;

const UserWithPriceItem = buildUserComponent(
  ({ user, active, price, onPaidChange, hasPaid }) =>
    <UserActiveStatus active={active}>
      {user.nick || user.name}{" "}
      <label>
        har betalat:{" "}
        <input type="checkbox" checked={hasPaid} onChange={onPaidChange} />
      </label>
    </UserActiveStatus>
);

const ParticipantsList = ({ handlePaidChange, participants }) => {
  const { hasPaid = [], hasNotPaid = [] } = groupBy(
    participants,
    info => (info.hasPaid ? "hasPaid" : "hasNotPaid")
  );

  return (
    <div>
      <Header>Deltagare</Header>
      {hasNotPaid.length === 0 && "Alla har betalat!"}
      {hasNotPaid.map(info =>
        <UserWithPriceItem
          key={info.id}
          active={true}
          userId={info.userId}
          onPaidChange={() => handlePaidChange(info)}
          price={info.amountOwed}
          hasPaid={info.hasPaid}
        />
      )}
      <hr />
      {hasPaid.map(info =>
        <UserWithPriceItem
          key={info.id}
          active={false}
          userId={info.userId}
          onPaidChange={() => handlePaidChange(info)}
          price={info.amountOwed}
          hasPaid={info.hasPaid}
        />
      )}
    </div>
  );
};

ParticipantsList.propTypes = {
  handlePaidChange: PropTypes.func.isRequired,
  participants: PropTypes.array.isRequired
};

export default ParticipantsList;
