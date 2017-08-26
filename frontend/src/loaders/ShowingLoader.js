import { connect } from "react-redux";
import { compose, lifecycle, branch, renderComponent } from "recompose";
import * as fetchers from "../lib/fetchers";
import Loader from "../ProjectorLoader";

const mapStateToProps = (state, { adminId, movieId }) => ({
  admin: state.users.data[adminId],
  movie: state.movies.data[movieId]
});

const selectShowing = connect(mapStateToProps, { ...fetchers });

const withShowingData = lifecycle({
  componentDidMount() {
    const { adminId, movieId, fetchUser, fetchMovie } = this.props;
    fetchUser(adminId);
    fetchMovie(movieId);
  }
});

const isLoading = ({ admin, movie }) => !(admin && movie);

// Will show Loader if isLoading
const showLoaderWhileFetching = branch(isLoading, renderComponent(Loader));

// Combine all of the HOCs into a single enhancer
export default compose(selectShowing, withShowingData, showLoaderWhileFetching);
