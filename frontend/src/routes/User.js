import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { mapValues } from "lodash";
import Field from "../Field";
import MainButton from "../MainButton";
import Input from "../Input";
import alfons from "../assets/alfons.jpg";
import { me as meActions } from "../store/reducers";
import { SmallHeader } from "../Header"

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

const ForetagsbiljettWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
`

const ForetagsbiljettInput = styled(Input)`
  max-width: 13.6em;
`

const TrashIcon = styled.span`
  font-size: 1.5em;
  padding-left: 0.5em;
  cursor: pointer;

`

const AddIcon = styled.span`
  font-size: 1.5em;
  cursor: pointer;
`

const AddForetagsbiljettContainer = styled.div`
    max-width: 15em;
    display: flex;
    justify-content: center;
`

const UserInfo = styled.div`padding: 1em;`;

class User extends Component {
  constructor(props) {
    super(props);

    const me = this.props.me;

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
    this.setState({
      editedUser: {
        ...this.state.editedUser,
        [key]: value
      }
    });
  };

  updateForetagsbiljetter = (foretagsbiljetter) => {
    this.setState({
      editedUser: {
        ...this.state.editedUser,
        foretagsbiljetter: foretagsbiljetter
      }
    })
  };

  editedForetagsbiljett = (index,  { target: { value } }) => {
    let foretagsbiljetter = this.state.editedUser.foretagsbiljetter;
    if(foretagsbiljetter.length > index) {
      foretagsbiljetter[index] = value
    }
    this.updateForetagsbiljetter(foretagsbiljetter)
  };

  addForetagsbiljett = () => {
    let foretagsbiljetter = this.state.editedUser.foretagsbiljetter;
    foretagsbiljetter.push("");
    this.updateForetagsbiljetter(foretagsbiljetter)
  };

  removeForetagsbiljett = (i) => {
    let foretagsbiljetter = this.state.editedUser.foretagsbiljetter.filter((ftg, index) => index !== i);
    this.updateForetagsbiljetter(foretagsbiljetter);
  };

  trim = (v) => {
    if(v.trim) {
      return v.trim()
    } else {
      return v.map(item => item.trim())
    }
  };

  handleSubmit = () => {
    const trimmedValues = mapValues(this.state.editedUser, this.trim);
    this.props.dispatch(
      meActions.actions.requestUpdate({
        id: this.props.me.id,
        ...trimmedValues
      })
    );
  };

  renderForetagsbiljett = (ftg, i) => {
    return (<ForetagsbiljettWrapper key={i}>
      <ForetagsbiljettInput
        type="text"
        value={ftg}
        maxLength={11}
        onChange={v => this.editedForetagsbiljett(i, v)}
      />
      <TrashIcon><i onClick={() => this.removeForetagsbiljett(i)} className="fa fa-trash" aria-hidden="true" /></TrashIcon>
    </ForetagsbiljettWrapper>)
  }

  render() {
    const { me, className, error, success } = this.props;
    const { phone, bioklubbnummer, nick, foretagsbiljetter } = this.state.editedUser;
    return (
      <div className={className}>
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

        <SmallHeader> Företagsbiljetter </SmallHeader>
        {foretagsbiljetter.map((ftg, i) => this.renderForetagsbiljett(ftg, i))}
        <AddForetagsbiljettContainer onClick={this.addForetagsbiljett}>
          <AddIcon><i className="fa fa-plus-circle" aria-hidden="true" /></AddIcon>
        </AddForetagsbiljettContainer>

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
