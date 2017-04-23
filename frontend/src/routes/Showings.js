import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import moment from "moment";

import { getTodaysDate } from "../lib/dateTools";
import { showings as showingActions } from "../store/reducers";

import Header from "../Header";
import Showing from "../Showing";

const today = getTodaysDate();

class Showings extends Component {
    componentWillMount() {
        this.props.dispatch(showingActions.actions.requestIndex());
    }
    render() {
        const { className, showings = [] } = this.props;

        const { previous, upcoming } = _.groupBy(showings, s => moment(s.date).isBefore(today) ? 'previous' : 'upcoming')

        return (
            <div className={className}>
                <Header>Aktuella Besök</Header>
                {_.sortBy(upcoming, 'date').map(showing => (
                    <Showing key={showing.id} movieId={showing.movieId} date={showing.date} admin={showing.admin} location={showing.location.name} />
                ))}
                <Header>Tidigare Besök</Header>
                {_.sortBy(previous, 'date').map(showing => (
                    <Showing key={showing.id} disabled={true} movieId={showing.movieId} date={showing.date} admin={showing.admin} location={showing.location.name} />
                ))}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    showings: Object.values(state.showings.data)
})


export default connect(mapStateToProps)(Showings);
