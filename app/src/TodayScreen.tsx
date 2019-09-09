import gql from "graphql-tag";
import { orderBy } from "lodash";
import * as React from "react";
import { RefreshControl, ScrollView } from "react-native";
import { NavigationInjectedProps, StackActions } from "react-navigation";
import { useQuery } from "urql";
import { ShowingsByMovieQuery } from "./__generated__/ShowingsByMovieQuery";
import {
  filterShowingsParticipatedByMeAndAfterToday,
  filterShowingsParticipatedByMeAndBeforeToday,
  showingDate
} from "./lib/filterShowings";
import { RedHeader } from "./RedHeader";
import { ShowingListItem } from "./ShowingListItem";
import { ShowingListItemContainer } from "./ShowingListItemContainer";

export const TodayScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useQuery<
    ShowingsByMovieQuery
  >({
    query: gql`
      query ShowingsByMovieQuery {
        me: currentUser {
          id
        }
        publicShowings {
          id
          date
          time
          myTickets {
            id
          }
          participants {
            user {
              id
              avatar
              firstName
              lastName
              nick
            }
          }
          location {
            name
          }
          movie {
            ...MovieListMovie
          }
        }
      }

      fragment MovieListMovie on Movie {
        id
        poster
        title
        releaseDate
        runtime
        imdbId
      }
    `
  });

  const onPress = (showingId: string) =>
    navigation.dispatch(
      StackActions.push({
        routeName: "Ticket",
        params: {
          showingId
        }
      })
    );

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetching} onRefresh={executeQuery} />
      }
    >
      {!fetching &&
        data && (
          <ShowingListItemContainer>
            <RedHeader>Mina kommande besök</RedHeader>
            {orderBy(
              data.publicShowings.filter(
                filterShowingsParticipatedByMeAndAfterToday(data.me.id)
              ),
              [showingDate],
              ["asc"]
            ).map(showing => (
              <ShowingListItem
                key={showing.id}
                showing={showing}
                onPressShowTicket={() => onPress(showing.id)}
              />
            ))}

            <RedHeader>Mina tidigare besök</RedHeader>
            {orderBy(
              data.publicShowings.filter(
                filterShowingsParticipatedByMeAndBeforeToday(data.me.id)
              ),
              [showingDate],
              ["desc"]
            ).map(showing => (
              <ShowingListItem
                key={showing.id}
                showing={showing}
                onPressShowTicket={() => onPress(showing.id)}
              />
            ))}
          </ShowingListItemContainer>
        )}
    </ScrollView>
  );
};
