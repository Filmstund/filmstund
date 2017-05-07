import React, { Component } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import _ from "lodash";
import { showings as showingActions } from "../store/reducers";

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

    handleUnattend = () => {
        this.props.dispatch(showingActions.actions.requestUnattend(this.props.showingId));
    }

    componentWillMount() {
        this.props.dispatch(showingActions.actions.requestSingle(this.props.showingId));
    }
    render() {
        const { className, showing, movie, me } = this.props;

        const isParticipating = showing.participants.includes(me.id)

        return (
            <div className={className}>
                <Showing
                    movie={movie}
                    date={showing.date}
                    adminId={showing.admin}
                    location={showing.location.name} />
                <Box>
                    {!isParticipating && <Option onClick={this.handleAttend}>Attend</Option>}
                    {isParticipating && <Option onClick={this.handleUnattend}>Unattend</Option>}
                </Box>
            </div>
        )
    }
}

const mapStateToProps = (state, props) => {
    const showing = state.showings.data[props.match.params.showingId];

    return {
        showingId: props.match.params.showingId,
        me: state.me.data,
        showing,
        movie: state.movies.data[showing.movieId]
    }
}


export default connect(mapStateToProps)(Showings);
