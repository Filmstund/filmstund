import React from "react";
import {connect} from "react-redux";

import { movies } from "../store/reducers";

import Header from "../Header";
import Movie from "../Movie";
import CreateShowingForm from "../CreateShowingForm";

const NewShowing = React.createClass({
    getInitialState() {
        const { match: { params: { movieId } } } = this.props;

        return { movieId }
    },
    componentWillMount() {
        this.props.dispatch(movies.actions.requestIndex());
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
    clearSelectedMovie() {
        this.setState({ movieId: null })
    },
    render() {
        const { movieId } = this.state;
        const { movies = [] } = this.props;

        if (movieId) {
            return (
                <CreateShowingForm movieId={movieId} clearSelectedMovie={this.clearSelectedMovie}/>
            )
        } else {
            return this.renderSelectMovie(movies);
        }
    }
});

const mapStateToProps = (state) => ({
    movies: Object.values(state.movies.data)
});


export default connect(mapStateToProps)(NewShowing);
