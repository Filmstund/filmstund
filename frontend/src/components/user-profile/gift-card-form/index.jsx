import React, {PropTypes} from 'react';

import { connect } from 'react-redux';
import { submitGiftCard } from '../../../store/actions';
import GoldButton from '../../gold-button'

import {TYPES, TYPE_NAME} from '../../gift-cards/consants';

import styles from './style.css';

const GiftCardForm = React.createClass({

    getInitialState() {
        return {
            cardForm: {
                number: '',
                card_type: TYPES[0],
            },
        }
    },

    handleSubmitNewPaymentCard(e) {
        console.log('submit');
        e.preventDefault();
        this.props.dispatch(submitGiftCard(this.state.cardForm))
    },

    handleChange(attr, event) {
        const newValue = event.target.value;
        this.setState({
            cardForm: {
                ...this.state.cardForm,
                [attr]: newValue
            }
        }, () => {
            console.log(this.state.cardForm);
        })
    },

    render() {

        const { cardForm } = this.state;

        return <div className={styles.container}>
            <h2>Lägg till rabbatkort/företagsbiljett</h2>
            <form className={styles.form} onSubmit={this.handleSubmitNewPaymentCard}>
                <div className={styles.formRow}>
                    <label htmlFor="number">Nummer</label>
                    <input type="text" value={cardForm.number} onChange={(e) => this.handleChange('number', e)} id="number" />
                </div>
                <div className={styles.formRow}>
                    <label htmlFor="type">Typ av kort</label>
                    <select id="type" value={cardForm.type} onChange={(e) => this.handleChange('card_type', e)}>
                        {TYPES.map((type, i) => <option key={type} value={type}>{TYPE_NAME[type]}</option>)}
                    </select>
                </div>
                <GoldButton disabled={cardForm.number.length == 0} >Lägg till</GoldButton>
            </form>
        </div>
    }
});

export default connect()(GiftCardForm)