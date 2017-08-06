import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import Helmet from "react-helmet";
import { mapValues } from "lodash";
import Field from "../../Field";
import MainButton from "../../MainButton";
import Input from "../../Input";
import alfons from "../../assets/alfons.jpg";
import { me as meActions } from "../../store/reducers";
import { formatYMD } from "../../lib/dateTools";

import { trim } from "../../Utils";

import ForetagsbiljettList from "./ForetagsbiljettList";

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

const UserInfo = styled.div`padding: 1em;`;

class User extends Component {
  constructor(props) {
    super(props);

    const { me } = this.props;

    this.state = {
      editedUser: {
        nick: me.nick || "",
        phone: me.phone || "",
        bioklubbnummer: me.bioklubbnummer || "",
        foretagsbiljetter: me.foretagsbiljetter || []
      }
    };
  }

  componentWillUnmount() {
    this.props.dispatch(meActions.actions.clearStatus());
  }

  setEditedUserValue = (key, { target: { value } }) => {
    this.setState(state => ({
      editedUser: {
        ...state.editedUser,
        [key]: value
      }
    }));
  };

  setBiljetter = foretagsbiljetter => {
    this.setState(state => ({
      editedUser: {
        ...state.editedUser,
        foretagsbiljetter
      }
    }));
  };

  handleSubmit = () => {
    const { editedUser } = this.state;
    const { me } = this.props;

    const trimmedValues = trim({
      ...editedUser,
      foretagsbiljetter: editedUser.foretagsbiljetter.map(ftg => ({
        ...ftg,
        expires: formatYMD(ftg.expires)
      }))
    });

    this.props.dispatch(
      meActions.actions.requestUpdate({
        id: me.id,
        ...trimmedValues
      })
    );
  };

  render() {
    const { me, className, error, success } = this.props;
    const {
      phone,
      bioklubbnummer,
      nick,
      foretagsbiljetter
    } = this.state.editedUser;
    return (
      <div className={className}>
        <Helmet title="Profil" />
        <Box>
          <AvatarImage src={me.avatar || alfons} />
          <UserInfo>
            <UserName>
              {me.name}
            </UserName>
            {me.nick &&
              <div>
                "{me.nick}"
              </div>}
            <div>
              {me.email}
            </div>
          </UserInfo>
        </Box>
        {error &&
          <StatusBox error={true}>
            {error.reason}
          </StatusBox>}
        {success === true && <StatusBox error={false}>Uppdaterades!</StatusBox>}
        <Field text="Nick:">
          <Input
            type="text"
            value={nick}
            onChange={v => this.setEditedUserValue("nick", v)}
          />
        </Field>
        <Field text="Bioklubbnummer:">
          <Input
            type="text"
            value={bioklubbnummer}
            maxLength={11}
            onChange={v => this.setEditedUserValue("bioklubbnummer", v)}
          />
        </Field>
        <Field text="Telefonnummer:">
          <Input
            type="phone"
            value={phone}
            onChange={v => this.setEditedUserValue("phone", v)}
          />
        </Field>
        <ForetagsbiljettList
          biljetter={foretagsbiljetter}
          onChange={this.setBiljetter}
        />
        <MainButton onClick={this.handleSubmit}>Spara användare</MainButton>
      </div>
    );
  }
}

export default connect(state => ({
  me: state.me.data,
  error: state.me.error,
  success: state.me.success
}))(User);
