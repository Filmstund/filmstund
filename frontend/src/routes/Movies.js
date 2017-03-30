import React from "react";
import { connect } from "react-redux";

import Header from "../Header";

import rest from "../store/reducers/rest"
import Movie from "../Movie";

const Movies = React.createClass({
    componentWillMount() {
        this.props.dispatch(rest.actions.movies.sync())
    },
    componentWillUnmount() {
        this.props.dispatch(rest.actions.movies.reset())
    },
    render() {
        const { className, movies = [] } = this.props;
        return (
            <div className={className}>
                <Header>Filmer hos SF</Header>
                {movies.map(movie => (
                    <Movie key={movie.id} movie={movie}/>
                ))}
            </div>
        )
    }
});

const mapStateToProps = (state) => ({
    movies: state.movies.data
})


export default connect(mapStateToProps)(Movies);
