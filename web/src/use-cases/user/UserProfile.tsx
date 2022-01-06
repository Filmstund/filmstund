import styled from "@emotion/styled";
import React, { useCallback, useState } from "react";
import alfons from "../../assets/alfons.jpg";
import Field, { FieldWithoutMaxWidth } from "../common/ui/Field";
import Input from "../common/ui/Input";
import MainButton from "../common/ui/MainButton";
import CopyValue from "../common/utils/CopyValue";
import { PageTitle } from "../common/utils/PageTitle";

import { ForetagsbiljettList } from "./ForetagsbiljettList";
import {
  useUpdateUserMutation,
  useUserProfileQuery,
} from "../../__generated__/types";
import { useToaster } from "../../common/toast/ToastContext";

const Box = styled.div`
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  height: 96px;
`;

const AvatarImage = styled.div<{ src: string | undefined | null }>`
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

interface Props {}

export const UserProfile: React.FC<Props> = () => {
  const [{ data }] = useUserProfileQuery();
  const me = data!.me;
  const toast = useToaster();
  const [, mutate] = useUpdateUserMutation();

  const [formState, handleChange, setEditedUser] = useStateWithHandleChangeName(
    {
      nick: me.nick ?? "",
      phone: me.phone ?? "",
      firstName: me.firstName,
      lastName: me.lastName,
      filmstadenMembershipID: me.filmstadenMembershipID ?? "",
    }
  );

  const handleSubmit = () => {
    mutate({
      user: {
        firstName: formState.firstName.trim(),
        lastName: formState.lastName.trim(),
        nick: formState.nick.trim(),
        phone: formState.phone.trim(),
        filmstadenMembershipID: formState.filmstadenMembershipID.trim(),
      },
    }).then(({ data, error }) => {
      if (data) {
        const { nick, phone, filmstadenMembershipID, lastName, firstName } =
          data.editedUser;

        setEditedUser({
          firstName: firstName,
          lastName: lastName,
          nick: nick ?? "",
          phone: phone ?? "",
          filmstadenMembershipID: filmstadenMembershipID ?? "",
        });

        toast({ text: "Uppdaterades!", variant: "success" });
      } else if (error) {
        error.graphQLErrors.forEach((e) => {
          toast({ text: e.message, variant: "danger" });
        });
      }
    });
  };

  return (
    <>
      <PageTitle title="Profil" />
      <Box>
        <AvatarImage src={me.avatarURL} />
        <UserInfo>
          {me.nick && <UserName>{me.nick}</UserName>}
          <div>{me.name}</div>
          <div>{me.email}</div>
        </UserInfo>
      </Box>
      <Field text="First name:">
        <Input
          type="text"
          name="firstName"
          value={formState.firstName}
          onChange={handleChange}
        />
      </Field>
      <Field text="Last name:">
        <Input
          type="text"
          name="lastName"
          value={formState.lastName}
          onChange={handleChange}
        />
      </Field>
      <Field text="Nick:">
        <Input
          type="text"
          name="nick"
          value={formState.nick}
          onChange={handleChange}
        />
      </Field>
      <Field text="Filmstaden medlemsnummer:">
        <Input
          type="text"
          value={formState.filmstadenMembershipID}
          name="filmstadenMembershipID"
          placeholder="XXX-XXX"
          maxLength={7}
          onChange={handleChange}
        />
      </Field>
      <Field text="Telefonnummer:">
        <Input
          type="phone"
          name="phone"
          value={formState.phone}
          placeholder={"07x-000 00 00"}
          onChange={handleChange}
        />
      </Field>
      <FieldWithoutMaxWidth text="Kalenderlänk:">
        {me.calendarFeedUrl && <CopyValue text={me.calendarFeedUrl} />}
      </FieldWithoutMaxWidth>
      <MainButton onClick={handleSubmit}>Spara användare</MainButton>
      <ForetagsbiljettList foretagsbiljetter={me.giftCertificates || []} />
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
