import React from "react";
import {connect} from "react-redux";
import { sortBy } from "lodash";
import moment from "moment";

import { jsonRequest, withBaseURL } from "../lib/fetch";


import { movies, meta } from "../store/reducers";

import Header from "../Header";
import Loader from "../Loader";
import Movie from "../Movie";
import CreateShowingForm from "../CreateShowingForm";

class NewShowing extends React.Component {
    constructor(props) {
        super(props);
        const { match: { params: { movieId } } } = props;

        this.state = { movieId }
    }

    componentWillMount() {
        this.props.dispatch(movies.actions.requestIndex());
    }

    requestSFData = () => {
        this.setState({ requestingData: true })
        jsonRequest(withBaseURL("/movies/sf/populate")).then(data => {
            this.props.dispatch(movies.actions.requestIndex());
            this.props.dispatch(meta.actions.requestSingle());
            this.setState({ requestingData: false })
        })
    }

    renderRequestButton = () => {
        if (this.state.requestingData) {
            return <Loader size={70} color="maroon" />
        } else {
            return <div onClick={this.requestSFData}>Uppdatera data från SF</div>
        }
    }

    renderSelectMovie = (movies) => {
        const { meta } = this.props;

        return (
            <div>
                <Header>Skapa besök</Header>
                Senaste uppdatering från SF: {(!meta.timestamp && "aldrig") || moment(meta.timestamp).format('YYYY-MM-DD HH:mm')}
                {this.renderRequestButton()}
                {sortBy(movies, 'releaseDate').map(m => (
                    <Movie key={m.id} movie={m} onClick={() => this.setState({ movieId: m.id })} />
                ))}
            </div>
        )
    }

    clearSelectedMovie = () => {
        this.setState({ movieId: null })
    }

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
}

const mapStateToProps = (state) => ({
    movies: Object.values(state.movies.data),
    meta: state.meta.data
});


export default connect(mapStateToProps)(NewShowing);
