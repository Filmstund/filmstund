import styled from "@emotion/styled";

import { groupBy } from "lodash-es";
import * as React from "react";

import Header from "../../common/ui/Header";
import {
  SingleShowing_showing_adminPaymentDetails_participantPaymentInfos,
  SingleShowing_showing_adminPaymentDetails_participantPaymentInfos_user
} from "../containers/__generated__/SingleShowing";

const UserActiveStatus = styled.div<{ active: boolean }>`
  color: ${props => (props.active ? "#000" : "#ccc")};
`;

interface UserWithPriceItemProps {
  user: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos_user;
  active: boolean;
  onPaidChange: () => void;
  hasPaid: boolean;
}

const UserWithPriceItem: React.FC<UserWithPriceItemProps> = ({
  user,
  active,
  onPaidChange,
  hasPaid
}) => (
  <UserActiveStatus active={active}>
    {user.nick || user.name}{" "}
    <label>
      har betalat:{" "}
      <input type="checkbox" checked={hasPaid} onChange={onPaidChange} />
    </label>
  </UserActiveStatus>
);

interface UserWithPriceItemListProps {
  participantPaymentInfos: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos[];
  handlePaidChange: (
    info: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos
  ) => void;
  paid: boolean;
}

const UserWithPriceItemList: React.FC<UserWithPriceItemListProps> = ({
  participantPaymentInfos,
  handlePaidChange,
  paid
}) => (
  <>
    {participantPaymentInfos.map(info => (
      <UserWithPriceItem
        key={info.user.id}
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
    info: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos
  ) => void;
  participants: SingleShowing_showing_adminPaymentDetails_participantPaymentInfos[];
}

export const PaymentParticipantsList: React.FC<
  PaymentParticipantsListProps
> = ({ handlePaidChange, participants }) => {
  const { hasPaid = [], hasNotPaid = [] } = groupBy(
    participants,
    info => (info.hasPaid ? "hasPaid" : "hasNotPaid")
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
