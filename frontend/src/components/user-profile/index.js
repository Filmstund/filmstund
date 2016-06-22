import React from 'react';
import { connect } from 'react-redux';

import { getUser } from '../../store/reducer'
import styles from './style.css'


const UserProfile = React.createClass({
  getInitialState() {
    return {
      userForm: this.props.user
    }
  },
  handleChange(attr, event) {
    const newValue = event.target.value;
    this.setState({
      userForm: {
        ...this.state.userForm,
        [attr]: newValue
      }
    }, () => {
      console.log(this.state.userForm);
    })
  },
  handleSubmit() {
    console.log(this.state.userForm)
  },
  render() {
    const { userForm } = this.state
    return (
      <div className={styles.userProfile}>
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
          <label htmlFor="pushoverKey">Pushover nyckel</label>
          <input type="text" value={userForm.pushoverKey} onChange={(e) => this.handleChange('pushoverKey', e)} id="pushoverKey" />
        </div>
       </form>
      </div>
    )
  }
})

export default connect(state => ({
  user: getUser(state)
}))(UserProfile)
