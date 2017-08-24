import React, { PureComponent } from "react";
import { connect } from "react-redux";

import {
  showings as showingActions,
  users as userActions
} from "../../store/reducers";

import Loader from "../../ProjectorLoader";
import SingleShowing from "./SingleShowing";

class ShowingLoader extends PureComponent {
  componentWillMount() {
    let adminId = null;
    if (this.props.showing) {
      adminId = this.props.showing.adminId;
      if (adminId) {
        this.props.requestUser(adminId);
      }
    }

    this.props.requestShowing(this.props.showingId).then(showing => {
      if (showing.adminId !== adminId) {
        this.props.requestUser(showing.adminId);
      }
    });
  }
  render() {
    const { admin, showing } = this.props;

    if (admin && showing) {
      return <SingleShowing {...this.props} />;
    } else {
      return <Loader />;
    }
  }
}

export default connect(
  (state, props) => {
    const { showingId } = props.match.params;
    const showing = state.showings.data[showingId];

    const adminId = showing && showing.admin;

    return {
      showingId,
      adminId,
      showing,
      admin: state.users.data[adminId],
      me: state.me.data
    };
  },
  {
    requestShowing: showingActions.actions.requestSingle,
    requestUser: userActions.actions.requestSingle
  }
)(ShowingLoader);
