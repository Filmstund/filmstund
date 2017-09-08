import { connect } from "react-redux";
import { compose, lifecycle, branch, renderComponent } from "recompose";
import * as fetchers from "../lib/fetchers";
import Loader from "../ProjectorLoader";
import { getShowing } from "../store/reducers/showings";

const mapStateToProps = (state, { showingId }) => {
  const showing = getShowing(state, showingId);
  return {
    showing,
    me: state.me.data,
    admin: state.users.data[showing && showing.admin],
    movie: state.movies.data[showing && showing.movieId]
  };
};

const selectShowing = connect(mapStateToProps, { ...fetchers });

const withShowingData = lifecycle({
  componentDidMount() {
    const {
      showingId,
      showing,
      fetchShowing,
      fetchUser,
      fetchMe,
      fetchMovie
    } = this.props;

    fetchMe();
    if (showing) {
      fetchUser(showing.admin);
      fetchMovie(showing.movieId);
    } else {
      fetchShowing(showingId);
    }
  }
});

const isLoading = ({ admin, movie }) => !(admin && movie);

// Will show Loader if isLoading
const showLoaderWhileFetching = branch(isLoading, renderComponent(Loader));

// Combine all of the HOCs into a single enhancer
export default compose(selectShowing, withShowingData, showLoaderWhileFetching);
