import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectPayment } from '../../../store/actions';

const EXTERN = 'extern';
const PaymentSelector = React.createClass({
    propTypes: {
        giftCards: PropTypes.array,
        showingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
        currentPaymentMethod: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    },

    getDefaultProps() {
        return {
            giftCards: [],
            currentPaymentMethod: EXTERN
        }

    },

    handleChange(showingId, e) {

        const cardId = e.target.value == EXTERN ? null : e.target.value;
        console.log(showingId, e.target.value);
        this.props.dispatch(
            selectPayment(showingId, cardId)
        );
    },



    render() {
        const { giftCards, showingId, currentPaymentMethod } = this.props;



        return <div>
            { !giftCards && <div>You have no cards</div>}
            {  giftCards &&
                <div>
                    <label htmlFor="type">Välj ett betalningsalternativ</label><br />
                    <select id="paymentOption" value={currentPaymentMethod} onChange={(e) => this.handleChange(showingId, e)}>

                        {giftCards.map(card => <option key={card.id} value={card.id}>{`${card.card_type} ${card.number}`}</option>)}
                        <option key="extern" value={EXTERN}>extern (Swish etc...)</option>
                    </select>

                </div>
            }
        </div>
    }

});

export default connect()(PaymentSelector)