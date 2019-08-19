import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React from "react";
import { movieFragment } from "../common/showing/Showing";
import Loader from "../common/utils/ProjectorLoader";
import {
  CreateShowingQuery,
  CreateShowingQueryVariables
} from "./__generated__/CreateShowingQuery";
import { CreateShowingForm } from "./CreateShowingForm";

interface FetcherProps {
  movieId: string;
  navigateToShowing: (s: { webId: string; slug: string }) => void;
  clearSelectedMovie: () => void;
}

export const CreateShowingFormFetcher: React.FC<FetcherProps> = ({
  movieId,
  navigateToShowing,
  clearSelectedMovie
}) => {
  const { data } = useCreateShowingData(movieId);

  if (!data || !data.me) {
    return <Loader />;
  } else {
    return (
      <CreateShowingForm
        data={data}
        movieId={movieId}
        navigateToShowing={navigateToShowing}
        clearSelectedMovie={clearSelectedMovie}
      />
    );
  }
};

const useCreateShowingData = (movieId: string) =>
  useQuery<CreateShowingQuery, CreateShowingQueryVariables>(
    gql`
      query CreateShowingQuery($movieId: UUID!) {
        movie(id: $movieId) {
          ...ShowingMovie
          releaseDate
        }
        me: currentUser {
          id
          nick
          name
        }
        previousLocations {
          name
        }
        sfCities {
          name
          alias
        }
      }
      ${movieFragment}
    `,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        movieId
      }
    }
  );
