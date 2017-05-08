import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { showings as showingActions, users as userActions } from "../store/reducers";
import withLoader from "../lib/withLoader";

import Showing from "../Showing";
import UserItem from "../UserItem";
import MainButton, { GreenButton, RedButton, GrayButton } from "../MainButton";

class Showings extends Component {
    constructor(props) {
        super(props);

    }

    handleAttend = () => {
        this.props.dispatch(showingActions.actions.requestAttend(this.props.showingId));
    }

    handleDelete = () => {
        const proceed = confirm("Är du säker? Går ej att ångra!");

        if (proceed) {
            this.props.dispatch(showingActions.actions.requestDelete(this.props.showingId));
        }
    }

    handleUnattend = () => {
        this.props.dispatch(showingActions.actions.requestUnattend(this.props.showingId));
    }

    handleStartBooking = () => {
        // TODO
    }

    renderAdminAction = () => {
        const { className, showing, me } = this.props;

        if (showing.admin !== me.id) {
            return null;
        } else {
            return <div>
                <MainButton onClick={this.handleStartBooking}>Alla är med, nu bokar vi!</MainButton>
                <GrayButton onClick={this.handleDelete}>Ta bort Besök</GrayButton>
            </div>
        }
    }

    render() {
        const { className, showing, me } = this.props;

        const isParticipating = showing.participants.includes(me.id)

        return (
            <div className={className}>
                <Showing
                    movieId={showing.movieId}
                    date={showing.date}
                    adminId={showing.admin}
                    location={showing.location.name} />
                {!isParticipating && <GreenButton onClick={this.handleAttend}>Jag hänger på!</GreenButton>}
                {isParticipating && <RedButton onClick={this.handleUnattend}>Avanmäl</RedButton>}
                <div>
                    {showing.participants.map(userId => <UserItem key={userId} userId={userId}/>)}
                </div>
                {this.renderAdminAction()}
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    const { showingId } = props.match.params
    const showing = state.showings.data[showingId]
    const adminId = showing && showing.admin

    return {
        showingId,
        adminId,
        showing: { ...state.showings, data: showing},
        admin: { ...state.users, data: state.users.data[adminId] },
        me: state.me.data
    }
}

export default connect(mapStateToProps)(withLoader({
    showing: ['showingId', showingActions.actions.requestSingle],
    admin: ['adminId', userActions.actions.requestSingle]
})(Showings));
