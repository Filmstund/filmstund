import { gql, useQuery } from "@apollo/client";
import React from "react";
import { useParams } from "react-router-dom";
import { oldShowingFragment } from "../common/showing/Showing";
import Loader from "../common/utils/ProjectorLoader";
import {
  EditShowingQuery,
  EditShowingQueryVariables,
} from "../../__generated__/types";
import EditShowingForm from "./EditShowingForm";

const useEditShowingData = (webID: string) =>
  useQuery<EditShowingQuery, EditShowingQueryVariables>(
    gql`
      query EditShowing($webID: Base64ID!) {
        me: currentUser {
          id
        }
        showing(webID: $webID) {
          ...OldShowing
          price
          private
          filmstadenShowingID
          location
          payToUser {
            id
          }
        }
        previouslyUsedLocations
      }
      ${oldShowingFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
      variables: { webID },
    }
  );

const EditShowingFormLoader = () => {
  const { webID } = useParams<"webID">();
  const { data } = useEditShowingData(webID!);

  if (!data || !data.showing) {
    return <Loader />;
  }

  return (
    <EditShowingForm
      showing={data.showing}
      previousLocations={data.previouslyUsedLocations}
    />
  );
};

export default EditShowingFormLoader;
