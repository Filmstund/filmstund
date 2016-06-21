import React from 'react';

import styles from './style.css'

const UserProfile = React.createClass({
  getInitialState() {
    return {
      userForm: {
        nick: '',
        email: '',
        sfMembershipLevel: 'BRONZE',
        phoneNumber: '',
        bioklubbsnummer: '',
        pushoverKey: '',
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
  handleSubmit() {
    console.log(this.state.userForm)
  },
  render() {
    const { user } = this.props
    const { userForm } = this.state
    return (
      <div className={styles.userProfile}>
       {JSON.stringify(user, undefined, 2)}
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
          <label htmlFor="phoneNumber">Telefonnummer</label>
          <input type="tel" value={userForm.phoneNumber} onChange={(e) => this.handleChange('phoneNumber', e)} id="phoneNumber" />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="bioklubbsnummer">Bioklubbsnummer</label>
          <input type="text" value={userForm.bioklubbsnummer} onChange={(e) => this.handleChange('bioklubbsnummer', e)} id="bioklubbsnummer" />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="pushoverKey">Pushover key</label>
          <input type="text" value={userForm.pushoverKey} onChange={(e) => this.handleChange('pushoverKey', e)} id="pushoverKey" />
        </div>
       </form>
      </div>
    )
  }
})

export default UserProfile
