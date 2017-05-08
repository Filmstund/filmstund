import React, { Component } from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { showings as showingActions, users as userActions } from "../store/reducers";
import withLoader from "../lib/withLoader";

import Showing from "../Showing";
import UserItem from "../UserItem";
import MainButton from "../MainButton";

class Showings extends Component {
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
                {!isParticipating && <MainButton onClick={this.handleAttend}>Jag hänger på!</MainButton>}
                {isParticipating && <MainButton onClick={this.handleUnattend}>Avanmäl</MainButton>}
                <div>
                    {showing.participants.map(userId => <UserItem key={userId} userId={userId}/>)}
                </div>
                {showing.admin === me.id && <button onClick={this.handleDelete}>Ta bort</button>}
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
