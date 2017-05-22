import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { mapValues } from "lodash";
import Field from "../Field";
import MainButton from "../MainButton";
import Input from "../Input";
import alfons from '../assets/alfons.jpg'
import { me as meActions } from '../store/reducers'

const Box = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  height: 100px;
`;

const AvatarImage = styled.div`
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  height: 100px;
  width: 100px;
`

const StatusBox = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin: 1em 0;
  padding: 1em;
  background-color: ${props => props.error ? '#ef5353' : '#66bb6a'};
  color: ${props => props.error ? 'white' : 'black'}
`

const UserName = styled.h3`
  margin: 0;
  padding: 0;
`

const UserInfo = styled.div`
  padding: 1em;
`

class User extends Component {
  constructor(props) {
    super(props);

    const me = this.props.me

    this.state = {
      editedUser: {
        nick: me.nick || '',
        phone: me.phone || '',
        bioklubbnummer: me.bioklubbnummer || ''
      }
    }

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
    })
  }

  handleSubmit = () => {
    const trimmedValues = mapValues(this.state.editedUser, s => s.trim())
    this.props.dispatch(meActions.actions.requestUpdate({
      id: this.props.me.id,
      ...trimmedValues
    }))
  }

  render() {
    const { me, className, error, success } = this.props
    const { phone, bioklubbnummer, nick } = this.state.editedUser
    return (
      <div className={className}>
        <Box>
          <AvatarImage src={me.avatar || alfons} />
          <UserInfo>
            <UserName>{me.name}</UserName>
            {me.nick && <div>"{me.nick}"</div>}
            <div>{me.email}</div>
          </UserInfo>
        </Box>
        {error && <StatusBox error={true}>{error.reason}</StatusBox>}
        {success === true && <StatusBox error={false}>Uppdaterades!</StatusBox>}
        <Field text="Nick:">
            <Input type="text" value={nick} onChange={v => this.setEditedUserValue("nick", v)} />
        </Field>
        <Field text="Bioklubbnummer:">
            <Input type="text" value={bioklubbnummer} maxLength={11} onChange={v => this.setEditedUserValue("bioklubbnummer", v)} />
        </Field>
        <Field text="Telefonnummer:">
            <Input type="phone" value={phone} onChange={v => this.setEditedUserValue("phone", v)}/>
        </Field>
        <MainButton onClick={this.handleSubmit}>Spara användare</MainButton>
      </div>
    )
  }
}


export default connect(state => ({
  me: state.me.data,
  error: state.me.error,
  success: state.me.success
}))(User)
