import { compose, withProps } from "recompose";
import { connect } from "react-redux";
import TicketContainer from "./TicketContainer";
import withShowingRouteLoader from "../../loaders/ShowingRouteLoader";

import { showings as showingActions } from "../../store/reducers";

const routerParamsToShowingId = ({ match }) => {
  const { showingId } = match.params;

  return { showingId };
};

export default compose(
  connect(state => ({
    me: state.me.data
  }), {
      requestUpdate: showingActions.actions.requestUpdate
    }),
  withProps(routerParamsToShowingId),
  withShowingRouteLoader
)(TicketContainer);
