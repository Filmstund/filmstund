import React from "react";
import { connect } from "react-redux";

import Header from "../Header";

import { movies } from "../store/reducers";
import Movie from "../Movie";

import _ from "lodash";


const Movies = React.createClass({
    componentWillMount() {
        this.props.dispatch(movies.actions.requestIndex());
    },
    render() {
        const { className, movies = [], history } = this.props;
        return (
            <div className={className}>
                <Header>Filmer hos SF</Header>
                {_.sortBy(movies, 'releaseDate').map(movie => (
                    <Movie key={movie.id} movie={movie} onClick={() => history.push(`/showings/new/${movie.id}`)} />
                ))}
            </div>
        )
    }
});

const mapStateToProps = (state) => ({
    movies: state.movies.data
})


export default connect(mapStateToProps)(Movies);
