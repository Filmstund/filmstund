import React, { useState, useCallback } from "react";
import styled from "@emotion/styled";
import Field, { FieldWithoutMaxWidth } from "../common/ui/Field";
import MainButton from "../common/ui/MainButton";
import CopyValue from "../common/utils/CopyValue";
import Input from "../common/ui/Input";
import alfons from "../../assets/alfons.jpg";

import { trim } from "../../lib/Utils";

import ForetagsbiljettListContainer from "./ForetagsbiljettListContainer";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../common/ui/PageWidthWrapper";
import { useApolloMutationResult } from "../common/utils/useApolloMutationResult";
import { PageTitle } from "../common/utils/PageTitle";
import { DataProps } from "react-apollo";
import { UserProfile } from "./__generated__/UserProfile";
import { useUpdateUserMutation } from "../../apollo/mutations/user";

const Box = styled.div`
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  height: 96px;
`;

const AvatarImage = styled.div<{ src: string | null }>`
  background-image: url(${props => props.src}), url(${alfons});
  background-size: cover;
  background-position: center;
  height: 96px;
  width: 96px;
`;

const UserName = styled.h3`
  margin: 0;
  padding: 0;
`;

const UserInfo = styled.div`
  padding: 1em;
`;

interface Props extends DataProps<UserProfile> {}

const Profile: React.FC<Props> = ({ data }) => {
  const me = data.me!;

  const updateUser = useUpdateUserMutation();

  const { success, errors, clearState, mutate } = useApolloMutationResult(
    updateUser
  );

  const [
    { phone, sfMembershipId, nick },
    handleChange,
    setEditedUser
  ] = useStateWithHandleChangeName({
    nick: me.nick || "",
    phone: me.phone || "",
    sfMembershipId: me.sfMembershipId || ""
  });

  const handleSubmit = useCallback(() => {
    const trimmedValues = trim({
      nick,
      phone,
      sfMembershipId
    });

    mutate(trimmedValues).then(({ data }) => {
      const editedUser = data!.editedUser;
      setEditedUser(editedUser);
      setTimeout(clearState, 5000);
    });
  }, [clearState, mutate, nick, phone, setEditedUser, sfMembershipId]);

  return (
    <PageWidthWrapper>
      <PageTitle title="Profil" />
      <Box>
        <AvatarImage src={me.avatar} />
        <UserInfo>
          {me.nick && <UserName>{me.nick}</UserName>}
          <div>"{me.name}"</div>
          <div>{me.email}</div>
        </UserInfo>
      </Box>
      <StatusMessageBox
        errors={errors}
        success={success}
        successMessage="Uppdaterades!"
      />
      <Field text="Nick:">
        <Input type="text" name="nick" value={nick} onChange={handleChange} />
      </Field>
      <Field text="SF medlemsnummer:">
        <Input
          type="text"
          value={sfMembershipId}
          name="sfMembershipId"
          placeholder="XXX-XXX"
          maxLength={7}
          onChange={handleChange}
        />
      </Field>
      <Field text="Telefonnummer:">
        <Input
          type="phone"
          name="phone"
          value={phone}
          placeholder={"07x-000 00 00"}
          onChange={handleChange}
        />
      </Field>
      <FieldWithoutMaxWidth text="Kalenderlänk:">
        {me.calendarFeedUrl && <CopyValue text={me.calendarFeedUrl} />}
      </FieldWithoutMaxWidth>
      <MainButton onClick={handleSubmit}>Spara användare</MainButton>
      <ForetagsbiljettListContainer foretagsbiljetter={me.foretagsbiljetter} />
    </PageWidthWrapper>
  );
};

const useStateWithHandleChangeName = <T extends object>(
  initialValue: T
): [
  T,
  (event: React.ChangeEvent<HTMLInputElement>) => void,
  React.Dispatch<React.SetStateAction<T>>
] => {
  const [state, setState] = useState<T>(initialValue);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;

      setState(state => ({ ...state, [name]: value }));
    },
    []
  );

  return [state, handleChange, setState];
};

export default Profile;
