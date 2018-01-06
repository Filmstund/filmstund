import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Helmet from "react-helmet";
import Field from "../../Field";
import MainButton from "../../MainButton";
import Input from "../../Input";
import alfons from "../../assets/alfons.jpg";

import { trim } from "../../Utils";

import ForetagsbiljettList from "./ForetagsbiljettList";
import { completeUserFragment } from "../../fragments/currentUser";
import { wrapMutate } from "../../store/apollo";

const Box = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  height: 96px;
`;

const AvatarImage = styled.div`
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  height: 96px;
  width: 96px;
`;

const StatusBox = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 1em 0;
  padding: 1em;
  background-color: ${props => (props.error ? "#ef5353" : "#66bb6a")};
  color: ${props => (props.error ? "white" : "black")};
`;

const UserName = styled.h3`
  margin: 0;
  padding: 0;
`;

const UserInfo = styled.div`
  padding: 1em;
`;

class User extends Component {
  constructor(props) {
    super(props);

    const { me } = this.props;

    this.state = {
      editedUser: {
        nick: me.nick || "",
        phone: me.phone || "",
        sfMembershipId: me.sfMembershipId || "",
        foretagsbiljetter: me.foretagsbiljetter || []
      }
    };
  }

  setEditedUserValue = (key, { target: { value } }) => {
    this.setState(state => ({
      editedUser: {
        ...state.editedUser,
        [key]: value
      }
    }));
  };

  handleSubmit = () => {
    const { editedUser: { nick, phone, sfMembershipId } } = this.state;

    const trimmedValues = trim({
      nick,
      phone,
      sfMembershipId
    });

    this.props
      .updateUser(trimmedValues)
      .then(success => {
        this.setState({ success: true, errors: null }, () => {
          setTimeout(() => {
            this.setState({ success: false });
          }, 5000);
        });
      })
      .catch(errors => {
        this.setState({ success: false, errors });
      });
  };

  render() {
    const { success, errors } = this.state;
    const { me, className, errorFtgTickets, successFtgTickets } = this.props;

    const { phone, sfMembershipId, nick } = this.state.editedUser;
    return (
      <div className={className}>
        <Helmet title="Profil" />
        <Box>
          <AvatarImage src={me.avatar || alfons} />
          <UserInfo>
            {me.nick && <UserName>{me.nick}</UserName>}
            <div>"{me.name}"</div>
            <div>{me.email}</div>
          </UserInfo>
        </Box>
        {errors && (
          <StatusBox error>{errors.map(e => e.message).join(", ")}</StatusBox>
        )}
        {success === true && <StatusBox>Uppdaterades!</StatusBox>}
        <Field text="Nick:">
          <Input
            type="text"
            value={nick}
            onChange={v => this.setEditedUserValue("nick", v)}
          />
        </Field>
        <Field text="SF medlemsnummer:">
          <Input
            type="text"
            value={sfMembershipId}
            placeholder="XXX-XXX"
            maxLength={7}
            onChange={v => this.setEditedUserValue("sfMembershipId", v)}
          />
        </Field>
        <Field text="Telefonnummer:">
          <Input
            type="phone"
            value={phone}
            placeholder={"07x-000 00 00"}
            onChange={v => this.setEditedUserValue("phone", v)}
          />
        </Field>
        <MainButton onClick={this.handleSubmit}>Spara användare</MainButton>
        {errorFtgTickets && (
          <StatusBox error={true}>{errorFtgTickets.reason}</StatusBox>
        )}
        {successFtgTickets === true && (
          <StatusBox error={false}>Företagsbiljetter uppdaterades!</StatusBox>
        )}
        <ForetagsbiljettList biljetter={me.foretagsbiljetter} />
      </div>
    );
  }
}

const data = graphql(
  gql`
    query UserProfile {
      me: currentUser {
        ...CompleteUser
      }
    }
    ${completeUserFragment}
  `,
  {
    props: ({ data: { me } }) => ({
      me
    })
  }
);

const update = graphql(
  gql`
    mutation UpdateUser($user: NewUserInfo!) {
      updateUser(newInfo: $user) {
        ...CompleteUser
      }
    }
    ${completeUserFragment}
  `,
  {
    props: ({ mutate }) => ({
      updateUser: user => wrapMutate(mutate, { user })
    })
  }
);

export default compose(data, update)(User);
