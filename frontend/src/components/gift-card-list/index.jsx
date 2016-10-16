
import React, {PropTypes} from 'react';

import { connect } from 'react-redux';
import { removeCard } from '../../store/actions'

import {TYPE_NAME} from '../gift-cards/consants';

import styles from './style.css';

const GiftCardList = React.createClass({

    propTypes: {
        cards: PropTypes.array.isRequired
    },

    removeCard(e, cardId) {
        console.log('removeCard', cardId);
        this.props.dispatch(removeCard(cardId));
    },

    render() {
        const { cards } = this.props;
        console.log('cards', cards);
        return (
            <div className={styles.container}>
                <h2>Kort du har</h2>
                {cards.length == 0 && <div>Inga kort</div>}
                {cards.map(c => {
                    return <div key={c.id}>
                        <span>{TYPE_NAME[c.card_type]}</span> <span>{c.number}</span> <button onClick={(e) => this.removeCard(e, c.id)}>Ta bort</button>
                    </div>
                })
                }
            </div>
        )
    }
});

export default connect()(GiftCardList)