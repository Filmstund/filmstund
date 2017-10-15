import { compose, withProps } from "recompose";
import EditShowingForm from "../EditShowingForm";
import withShowingRouteLoader from "../loaders/ShowingRouteLoader";

const routerParamsToShowingId = ({ match }) => {
  const { showingId } = match.params;

  return { showingId };
};

export default compose(
  withProps(routerParamsToShowingId),
  withShowingRouteLoader
)(EditShowingForm);
