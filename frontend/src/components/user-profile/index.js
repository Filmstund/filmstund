import React from 'react';
import { connect } from 'react-redux';

import GoldButton from '../gold-button'

import { getUser } from '../../store/reducer'
import { updateUser } from '../../store/actions'
import styles from './style.css'

import GiftCardForm from './gift-card-form';
import GiftCardList from '../gift-card-list';


const UserProfile = React.createClass({
  getInitialState() {
    return {
      userForm: {
        nick: '',
        email: '',
        phone_number: '',
        bioklubbsnummer: '',
        sf_membership_level: '',
        pushover_key: '',
        ...this.props.user
      }
    }
  },
  handleChange(attr, event) {
    const newValue = event.target.value;
    this.setState({
      userForm: {
        ...this.state.userForm,
        [attr]: newValue
      }
    })
  },

  handleSubmit(e) {
    e.preventDefault()

    this.props.dispatch(updateUser(this.state.userForm))
  },

  render() {
    const { userForm } = this.state;
    return (
        <div>
          <div className={styles.container}>
            <h1>Användaruppgifter</h1>
            <form className={styles.form} onSubmit={this.handleSubmit}>
            <div className={styles.formRow}>
              <label htmlFor="nick">Namn</label>
              <input type="text" value={userForm.nick} onChange={(e) => this.handleChange('nick', e)} id="nick" />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="email">Email</label>
              <input type="email" value={userForm.email} onChange={(e) => this.handleChange('email', e)} id="email" />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="phone_number">Telefonnummer</label>
              <input type="tel" value={userForm.phone_number} onChange={(e) => this.handleChange('phone_number', e)} id="phone_number" />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="bioklubbsnummer">Bioklubbsnummer</label>
              <input type="text" value={userForm.bioklubbsnummer} onChange={(e) => this.handleChange('bioklubbsnummer', e)} id="bioklubbsnummer" />
            </div>
            <div className={styles.formRow}>
              <label htmlFor="sf_membership_level">Medlemsskapsnivå</label>
              <select id="sf_membership_level" value={userForm.sf_membership_level} onChange={(e) => this.handleChange('sf_membership_level', e)}>
                <option value="BRONZE">Brons</option>
                <option value="SILVER">Silver</option>
                <option value="GOLD">Guld</option>
              </select>
            </div>
            <div className={styles.formRow}>
              <label htmlFor="pushover_key">Pushover-nyckel</label>
              <input type="text" value={userForm.pushover_key} onChange={(e) => this.handleChange('pushover_key', e)} id="pushover_key" />
            </div>
            <GoldButton>Spara</GoldButton>
           </form>
          </div>
          <GiftCardForm/>
          <GiftCardList cards={this.props.user.cards}/>
      </div>
    )
  }
})

export default connect(state => ({
  user: getUser(state)
}))(UserProfile)
