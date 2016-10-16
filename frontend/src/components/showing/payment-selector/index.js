import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchGiftCards } from '../../../store/actions/';

const PaymentSelector = React.createClass({
    componentDidMount() {
        this.props.dispatch(
            fetchGiftCards()
        )
    },

    render() {
        const { giftCards } = this.props;

        return <div>
            hello computer
            { !giftCards && <div>You have no cards</div>}
            {giftCards &&
                <div>Antal kort {giftCards.length}</div> &&
                giftCards.map(card => {
                    <div>{card}</div>
                })
            }
        </div>
    }

});

export default connect((state, props) => ({
    giftCards: state.user.gift_cards
}))(PaymentSelector)