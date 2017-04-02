import React from "react";
import {connect} from "react-redux";

import rest from "../store/reducers/rest";

import Header from "../Header";
import Movie from "../Movie";
import CreateShowingForm from "../CreateShowingForm";

const NewShowing = React.createClass({
    getInitialState() {
        const { match: { params: { movieId } } } = this.props;

        return { movieId }
    },
    componentWillMount() {
        this.props.dispatch(rest.actions.movies.sync())
    },
    componentWillUnmount() {
        this.props.dispatch(rest.actions.movies.reset("sync"))
    },
    renderSelectMovie(movies) {
        return (
            <div>
                <Header>Skapa besök</Header>
                {movies.map(m => (
                    <Movie key={m.id} movie={m} onClick={() => this.setState({ movieId: m.id })} />
                ))}
            </div>
        )
    },
    render() {
        const { movieId } = this.state;
        const { movies = [] } = this.props;

        if (movieId) {
            return (
                <CreateShowingForm movieId={movieId}/>
            )
        } else {
            return this.renderSelectMovie(movies);
        }
    }
});

const mapStateToProps = (state) => ({
    movies: state.movies.data
});


export default connect(mapStateToProps)(NewShowing);
