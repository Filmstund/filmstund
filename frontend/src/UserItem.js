import React from "react";
import { connect } from "react-redux";

import { users as userActions } from "./store/reducers";
import withLoader from "./lib/withLoader";

const UserItem = ({ user }) => (
  <div>{user.name}</div>
)

const mapStateToProps = (state, { userId }) => ({
  userId,
  user: { ...state.users, data: state.users.data[userId] }
})

export default connect(mapStateToProps)(withLoader({
    user: ['userId', userActions.actions.requestSingle]
})(UserItem));
