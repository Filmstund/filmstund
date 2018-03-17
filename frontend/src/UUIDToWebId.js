import { graphql } from "react-apollo";
import { compose, branch, renderComponent } from "recompose";
import gql from "graphql-tag";

const data = graphql(
  gql`
    query WebIdQuery($showingId: UUID!) {
      showing(id: $showingId) {
        id
        webId
        slug
      }
    }
  `,
  {
    props: ({ ownProps: { showingId, rest }, data: { loading, showing } }) => ({
      showingId,
      rest,
      loading,
      ...showing
    })
  }
);

const callChildrenWithProps = ({ children, ...props }) => children(props);
const isLoading = branch(({ webId }) => !webId, renderComponent(() => null));

export const UUIDToWebId = compose(data, isLoading)(callChildrenWithProps);
