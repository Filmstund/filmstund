import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import styled from "styled-components";
import Helmet from "react-helmet";
import Field, { FieldWithoutMaxWidth } from "../../use-cases/common/ui/Field";
import MainButton from "../../use-cases/common/ui/MainButton";
import CopyValue from "../../use-cases/common/utils/CopyValue";
import Input from "../../use-cases/common/ui/Input";
import alfons from "../../assets/alfons.jpg";

import { trim } from "../../lib/Utils";

import ForetagsbiljettList from "./ForetagsbiljettList";
import { completeUserFragment } from "../../apollo/queries/currentUser";
import { wrapMutate } from "../../store/apollo";
import { branch, renderComponent } from "recompose";
import Loader from "../../use-cases/common/utils/ProjectorLoader";
import StatusMessageBox from "../../use-cases/common/utils/StatusMessageBox";
import { PageWidthWrapper } from "../../use-cases/common/ui/PageWidthWrapper";

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

class User extends Component {
  constructor(props) {
    super(props);

    const { me } = props.data;

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
    const {
      editedUser: { nick, phone, sfMembershipId }
    } = this.state;

    const trimmedValues = trim({
      nick,
      phone,
      sfMembershipId
    });

    this.props
      .updateUser(trimmedValues)
      .then(({ data: { editedUser } }) => {
        this.setState({ editedUser, success: true, errors: null }, () => {
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
    const {
      data: { me }
    } = this.props;

    const { phone, sfMembershipId, nick } = this.state.editedUser;
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
        <FieldWithoutMaxWidth text="Kalenderlänk:">
          <CopyValue text={me.calendarFeedUrl} />
        </FieldWithoutMaxWidth>
        <MainButton onClick={this.handleSubmit}>Spara användare</MainButton>
        <ForetagsbiljettList foretagsbiljetter={me.foretagsbiljetter} />
      </PageWidthWrapper>
    );
  }
}

const data = graphql(
  gql`
    query UserProfile {
      me: currentUser {
        ...CompleteUser
        calendarFeedUrl
      }
    }
    ${completeUserFragment}
  `,
  {
    options: { fetchPolicy: "cache-and-network" }
  }
);

const update = graphql(
  gql`
    mutation UpdateUser($user: NewUserInfo!) {
      editedUser: updateUser(newInfo: $user) {
        ...CompleteUser
        calendarFeedUrl
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

const isLoading = branch(({ data: { me } }) => !me, renderComponent(Loader));

export default compose(
  data,
  update,
  isLoading
)(User);
