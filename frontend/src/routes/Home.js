import React, { Component } from "react";
import { connect } from "react-redux";

import { Link } from "../MainButton";
import Showing from "../Showing";
import Header from "../Header";
import Jumbotron from "../jumbotron/jumbotron";

import { showings, movies } from "../store/reducers/index"

class Home extends Component {
    componentWillMount() {
        this.props.dispatch(showings.actions.requestIndex());
        this.props.dispatch(movies.actions.requestIndex());
    }

    navigateToShowing = (showing) => {
        this.props.history.push(`/showings/${showing.id}`)
    }

    renderShowings = (showings) => {
        return showings.map(showing =>
            <Showing
                onClick={() => this.navigateToShowing(showing)}
                movieId={showing.movieId}
                key={showing.id}
                date={showing.date}
                adminId={showing.admin}
                location={showing.location.name} />
        )
    }

    renderCreatedByMe = (showings) => {
        const { me } = this.props;
        const myShowings = showings.filter(s => s.admin === me.id);

        return this.renderShowings(myShowings)
    }

    renderParticipatedByMe = (showings) => {
        const { me } = this.props;
        const myShowings = showings.filter(s => s.participants.includes(me.id));

        return this.renderShowings(myShowings)
    }

    render() {
        const { className, showings = [] } = this.props;
        return (
            <div className={className}>
                <Jumbotron>
                    <Header>Nytt besök?</Header>
                    <Link to="/showings/new">Skapa nytt besök</Link>
                </Jumbotron>
                <Header>Mina kommande besök</Header>
                {this.renderParticipatedByMe(showings)}
                <Header>Besök jag har skapat</Header>
                {this.renderCreatedByMe(showings)}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    showings: Object.values(state.showings.data),
    me: state.me.data
})


export default connect(mapStateToProps)(Home);
