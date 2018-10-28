import React, { useState, useCallback } from "react";
import styled from "styled-components";
import Helmet from "react-helmet";
import Field, { FieldWithoutMaxWidth } from "../../use-cases/common/ui/Field";
import MainButton from "../../use-cases/common/ui/MainButton";
import CopyValue from "../../use-cases/common/utils/CopyValue";
import Input from "../../use-cases/common/ui/Input";
import alfons from "../../assets/alfons.jpg";

import { trim } from "../../lib/Utils";

import ForetagsbiljettListContainer from "./ForetagsbiljettListContainer";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../../use-cases/common/ui/PageWidthWrapper";
import { useApolloMutationResult } from "../common/utils/useApolloMutationResult";

const Box = styled.div`
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  height: 96px;
`;

const AvatarImage = styled.div`
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

const Profile = ({ data: { me }, updateUser }) => {
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

    mutate(trimmedValues).then(({ data: { editedUser } }) => {
      setEditedUser(editedUser);
      setTimeout(clearState, 5000);
    });
  });

  return (
    <PageWidthWrapper>
      <Helmet title="Profil" />
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
        <CopyValue text={me.calendarFeedUrl} />
      </FieldWithoutMaxWidth>
      <MainButton onClick={handleSubmit}>Spara användare</MainButton>
      <ForetagsbiljettListContainer foretagsbiljetter={me.foretagsbiljetter} />
    </PageWidthWrapper>
  );
};

const useStateWithHandleChangeName = initialValue => {
  const [state, setState] = useState(initialValue);

  const handleChange = useCallback(event => {
    const { name, value } = event.target;

    setState(state => ({ ...state, [name]: value }));
  }, []);

  return [state, handleChange, setState];
};

export default Profile;
