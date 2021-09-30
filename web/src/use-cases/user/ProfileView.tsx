import styled from "@emotion/styled";
import React, { useCallback, useState } from "react";
import { useUpdateUserMutation } from "../../apollo/mutations/user";
import alfons from "../../assets/alfons.jpg";

import { trim } from "../../lib/Utils";
import { useFadeState } from "../common/hooks/useFadeState";
import Field, { FieldWithoutMaxWidth } from "../common/ui/Field";
import Input from "../common/ui/Input";
import MainButton from "../common/ui/MainButton";
import CopyValue from "../common/utils/CopyValue";
import { PageTitle } from "../common/utils/PageTitle";
import StatusMessageBox from "../common/utils/StatusMessageBox";
import { UserProfile_me } from "./__generated__/UserProfile";

import { ForetagsbiljettList } from "./ForetagsbiljettList";

const Box = styled.div`
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  height: 96px;
`;

const AvatarImage = styled.div<{ src: string | null }>`
  background-image: url(${(props) => props.src}), url(${alfons});
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

interface Props {
  me: UserProfile_me;
}

const Profile: React.FC<Props> = ({ me }) => {
  const [showSuccessMessage, bump] = useFadeState();
  const [mutate, { error, loading, called }] = useUpdateUserMutation();

  const success = called && !loading && !error && showSuccessMessage;

  const [{ phone, filmstadenMembershipId, nick }, handleChange, setEditedUser] =
    useStateWithHandleChangeName({
      nick: me.nick || "",
      phone: me.phone || "",
      filmstadenMembershipId: me.filmstadenMembershipId || "",
    });

  const handleSubmit = () => {
    const trimmedValues = trim({
      nick,
      phone,
      filmstadenMembershipId,
    });

    mutate({ variables: { user: trimmedValues } }).then(({ data }) => {
      if (data) {
        const { nick, phone, filmstadenMembershipId } = data.editedUser;

        setEditedUser({
          nick: nick || "",
          phone: phone || "",
          filmstadenMembershipId: filmstadenMembershipId || "",
        });

        bump();
      }
    });
  };

  return (
    <>
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
        errors={error ? error.graphQLErrors : null}
        success={success}
        successMessage="Uppdaterades!"
      />
      <Field text="Nick:">
        <Input type="text" name="nick" value={nick} onChange={handleChange} />
      </Field>
      <Field text="Filmstaden medlemsnummer:">
        <Input
          type="text"
          value={filmstadenMembershipId}
          name="filmstadenMembershipId"
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
      <ForetagsbiljettList foretagsbiljetter={me.foretagsbiljetter || []} />
    </>
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

      setState((state) => ({ ...state, [name]: value }));
    },
    []
  );

  return [state, handleChange, setState];
};

export default Profile;
