import { connect } from "react-redux";
import { compose, lifecycle, branch, renderComponent } from "recompose";
import * as fetchers from "../lib/fetchers";
import Loader from "../ProjectorLoader";

const mapStateToProps = (state, { userId }) => ({
  user: state.users.data[userId]
});

const selectUser = connect(mapStateToProps, { ...fetchers });

const withUserData = lifecycle({
  componentDidMount() {
    const { fetchUser, userId } = this.props;
    fetchUser(userId);
  }
});

const userIsUndefined = ({ user }) => user === undefined;

// Will show Loader if user is undefined
const showLoaderWhileFetching = branch(
  userIsUndefined,
  renderComponent(Loader)
);

// Combine all of the HOCs into a single enhancer
export default compose(selectUser, withUserData, showLoaderWhileFetching);
