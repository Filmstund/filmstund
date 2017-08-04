import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import Helmet from "react-helmet";
import { mapValues } from "lodash";
import Field from "../Field";
import MainButton from "../MainButton";
import Input from "../Input";
import alfons from "../assets/alfons.jpg";
import { me as meActions } from "../store/reducers";
import { SmallHeader } from "../Header"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { formatYMD } from "./../lib/dateTools";

import { trim } from "../Utils";

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

const ForetagsBiljettStatus = styled.span`

`

const BiljettField = styled(Field)`
  padding: 0 0.5em;
`


const DEFAULT_DATE = moment().add(1, 'years');

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
      let biljett = foretagsbiljetter[index];
      biljett.value = value;
    }
    this.updateForetagsbiljetter(foretagsbiljetter)
  };

  setForetagsbiljettExpires = (index, value) => {
    let foretagsbiljetter = this.state.editedUser.foretagsbiljetter;
    if(foretagsbiljetter.length > index) {
      let biljett = foretagsbiljetter[index];
      biljett.expires = value;
    }
    this.updateForetagsbiljetter(foretagsbiljetter)
  }

  addForetagsbiljett = () => {
    let foretagsbiljetter = this.state.editedUser.foretagsbiljetter;
    foretagsbiljetter.push({value: "", expires: DEFAULT_DATE});
    this.updateForetagsbiljetter(foretagsbiljetter)
  };

  removeForetagsbiljett = (i) => {
    let foretagsbiljetter = this.state.editedUser.foretagsbiljetter.filter((ftg, index) => index !== i);
    this.updateForetagsbiljetter(foretagsbiljetter);
  };



  handleSubmit = () => {
    const trimmedValues = mapValues(this.state.editedUser, trim);
    trimmedValues.foretagsbiljetter = this.state.editedUser.foretagsbiljetter
      .map(ftg => ({
        value: ftg.value,
        expires: formatYMD(ftg.expires),
        status: ftg.status
      }));

    this.props.dispatch(
      meActions.actions.requestUpdate({
        id: this.props.me.id,
        ...trimmedValues
      })
    );
  };

  renderForetagsbiljett = (ftg, i) => {
    let date = DEFAULT_DATE;
    if ( ftg.expires ) {
      date = moment(ftg.expires)
    }
    return (<ForetagsbiljettWrapper key={i}>
      <BiljettField text="Kod/Värde">
      <ForetagsbiljettInput
        type="text"
        value={ftg.value}
        maxLength={11}
        onChange={v => this.editedForetagsbiljett(i, v)}
      />
      </BiljettField>
      <BiljettField text="Går ut">
        <DatePicker
          selected={date}
          onChange={v => this.setForetagsbiljettExpires(i, v)}
        />
      </BiljettField>
      <BiljettField text="Status">
        <ForetagsBiljettStatus>{ftg.status || "Available"}</ForetagsBiljettStatus>
      </BiljettField>
      <TrashIcon><i onClick={() => this.removeForetagsbiljett(i)} className="fa fa-trash" aria-hidden="true" /></TrashIcon>
    </ForetagsbiljettWrapper>)
  }

  render() {
    const { me, className, error, success } = this.props;
    const { phone, bioklubbnummer, nick, foretagsbiljetter } = this.state.editedUser;
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
