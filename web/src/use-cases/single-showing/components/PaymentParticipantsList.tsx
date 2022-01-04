import styled from "@emotion/styled";

import { groupBy } from "lodash";
import * as React from "react";

import Header from "../../common/ui/Header";
import { ShowingAdminFragment } from "../../../__generated__/types";

const UserActiveStatus = styled.div<{ active: boolean }>`
  color: ${(props) => (props.active ? "#000" : "#ccc")};
`;

interface UserWithPriceItemProps {
  user: NonNullable<
    ShowingAdminFragment["adminPaymentDetails"]
  >["attendees"][0]["user"];
  active: boolean;
  onPaidChange: () => void;
  hasPaid: boolean;
}

const UserWithPriceItem: React.FC<UserWithPriceItemProps> = ({
  user,
  active,
  onPaidChange,
  hasPaid,
}) => (
  <UserActiveStatus active={active}>
    {user.nick || user.firstName + " " + user.lastName}{" "}
    <label>
      har betalat:{" "}
      <input type="checkbox" checked={hasPaid} onChange={onPaidChange} />
    </label>
  </UserActiveStatus>
);

interface UserWithPriceItemListProps {
  participantPaymentInfos: NonNullable<
    ShowingAdminFragment["adminPaymentDetails"]
  >["attendees"];
  handlePaidChange: (
    info: NonNullable<
      ShowingAdminFragment["adminPaymentDetails"]
    >["attendees"][0]
  ) => void;
  paid: boolean;
}

const UserWithPriceItemList: React.FC<UserWithPriceItemListProps> = ({
  participantPaymentInfos,
  handlePaidChange,
  paid,
}) => (
  <>
    {participantPaymentInfos.map((info) => (
      <UserWithPriceItem
        key={info.userID}
        active={paid}
        user={info.user}
        onPaidChange={() =>
          handlePaidChange({ ...info, hasPaid: !info.hasPaid })
        }
        hasPaid={info.hasPaid}
      />
    ))}
  </>
);

interface PaymentParticipantsListProps {
  handlePaidChange: (
    info: NonNullable<
      ShowingAdminFragment["adminPaymentDetails"]
    >["attendees"][0]
  ) => void;
  participants: NonNullable<
    ShowingAdminFragment["adminPaymentDetails"]
  >["attendees"];
}

export const PaymentParticipantsList: React.FC<
  PaymentParticipantsListProps
> = ({ handlePaidChange, participants }) => {
  const { hasPaid = [], hasNotPaid = [] } = groupBy(participants, (info) =>
    info?.hasPaid ? "hasPaid" : "hasNotPaid"
  );

  return (
    <div>
      <Header>Deltagare</Header>
      {hasNotPaid.length === 0 && "Alla har betalat!"}
      <UserWithPriceItemList
        paid={false}
        participantPaymentInfos={hasNotPaid}
        handlePaidChange={handlePaidChange}
      />

      <hr />
      <UserWithPriceItemList
        paid={true}
        participantPaymentInfos={hasPaid}
        handlePaidChange={handlePaidChange}
      />
    </div>
  );
};
