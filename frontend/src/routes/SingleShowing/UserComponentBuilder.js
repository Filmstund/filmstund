import { connect } from "react-redux";

import { users as userActions } from "../../store/reducers";
import withLoader from "../../lib/withLoader";

const mapStateToProps = (state, { userId }) => ({
  userId,
  user: { ...state.users, data: state.users.data[userId] }
});

const UserComponentBuilder = UserComponent =>
  connect(mapStateToProps)(
    withLoader({
      user: ["userId", userActions.actions.requestSingle]
    })(UserComponent)
  );

export default UserComponentBuilder;
