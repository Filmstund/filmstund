import gql from "graphql-tag";
import React from "react";
import { useQuery } from "react-apollo";
import { useRouter } from "../../lib/useRouter";
import { oldShowingFragment } from "../common/showing/Showing";
import Loader from "../common/utils/ProjectorLoader";
import { EditShowing, EditShowingVariables } from "./__generated__/EditShowing";
import EditShowingForm from "./EditShowingForm";

const useEditShowingData = (webId: string) =>
  useQuery<EditShowing, EditShowingVariables>(
    gql`
      query EditShowing($webId: Base64ID!) {
        me: currentUser {
          id
        }
        showing(webId: $webId) {
          ...OldShowing
          price
          private
          filmstadenRemoteEntityId
          location {
            cityAlias
          }
          payToUser {
            id
          }
        }
        previousLocations {
          name
        }
      }
      ${oldShowingFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
      variables: { webId }
    }
  );

const EditShowingFormLoader = () => {
  const { match } = useRouter<{ webId: string }>();
  const { webId } = match.params;
  const { data } = useEditShowingData(webId);

  if (!data || !data.showing) {
    return <Loader />;
  }

  return (
    <EditShowingForm
      showing={data.showing}
      previousLocations={data.previousLocations}
    />
  );
};

export default EditShowingFormLoader;
