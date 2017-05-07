import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import _ from "lodash";
import { showings as showingActions, users as userActions } from "../store/reducers";
import withLoader from "../lib/withLoader";

import Showing from "../Showing";

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  color: #8E1B1B;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
`;

const Box = styled.div`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  width: 100%;
`;

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
                <Box>
                    {!isParticipating && <Option onClick={this.handleAttend}>Attend</Option>}
                    {isParticipating && <Option onClick={this.handleUnattend}>Unattend</Option>}
                </Box>
                {showing.admin === me.id && <button onClick={this.handleDelete}>Delete</button>}
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
