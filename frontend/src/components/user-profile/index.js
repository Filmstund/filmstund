import { subscribe } from 'horizon-react';
import React from 'react';

import styles from './style.css'

const UserProfile = React.createClass({
  getInitialState() {
    return {
      userForm: {
        name: '',
        bioklubbsnummer: '',
        pushoverKey: '',
      }
    }
  },
  render() {
    const { user } = this.props
    const { userForm } = this.state
    return (
      <div>
       {JSON.stringify(user, undefined, 2)}
       <form className={styles.form} onSubmit={this.handleSubmit}>
        <div className={styles.formRow}>
          <label htmlFor="name">Namn</label>
          <input type="text" value={userForm.name} id="name" />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="bioklubbsnummer">Bioklubbsnummer</label>
          <input type="text" value={userForm.bioklubbsnummer} id="bioklubbsnummer" />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="pushoverKey">Pushover key</label>
          <input type="text" value={userForm.pushoverKey} id="pushoverKey" />
        </div>
       </form>
      </div>
    )
  }
})

export default UserProfile