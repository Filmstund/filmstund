import gql from "graphql-tag";
import { orderBy } from "lodash";
import * as React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { NavigationInjectedProps, StackActions } from "react-navigation";
import { useQuery } from "urql";
import {
  ShowingsByMovieQuery,
  ShowingsByMovieQuery_publicShowings
} from "./__generated__/ShowingsByMovieQuery";
import {
  filterShowingsParticipatedByMeAndAfterToday,
  filterShowingsParticipatedByMeAndBeforeToday,
  showingDate
} from "./lib/filterShowings";
import { RedHeader } from "./RedHeader";
import { ShowingListItem } from "./ShowingListItem";
import { ShowingListItemContainer } from "./ShowingListItemContainer";

const OrderedShowingList = ({
  onPressShowing,
  onPressTicket,
  order,
  showings
}: {
  order: "asc" | "desc";
  showings: ShowingsByMovieQuery_publicShowings[];
  onPressTicket: (showingId: string) => void;
  onPressShowing: (showingId: string) => void;
}) => {
  if (showings.length === 0) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: 50
        }}
      >
        <Text style={{ color: "#9b9b9b" }}>Inga besök</Text>
      </View>
    );
  }

  return (
    <>
      {orderBy(showings, [showingDate], [order]).map(
        (showing: ShowingsByMovieQuery_publicShowings) => (
          <ShowingListItem
            key={showing.id}
            showing={showing}
            onPressShowTicket={() => onPressTicket(showing.id)}
            onPressShowing={() => onPressShowing(showing.id)}
          />
        )
      )}
    </>
  );
};

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

  const onPressShowing = (showingId: string) =>
    navigation.dispatch(
      StackActions.push({
        routeName: "Showing",
        params: {
          showingId
        }
      })
    );

  const onPressTicket = (showingId: string) =>
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
            <OrderedShowingList
              order={"asc"}
              showings={data.publicShowings.filter(
                filterShowingsParticipatedByMeAndAfterToday(data.me.id)
              )}
              onPressShowing={onPressShowing}
              onPressTicket={onPressTicket}
            />

            <RedHeader>Mina tidigare besök</RedHeader>
            <OrderedShowingList
              order={"desc"}
              showings={data.publicShowings.filter(
                filterShowingsParticipatedByMeAndBeforeToday(data.me.id)
              )}
              onPressShowing={onPressShowing}
              onPressTicket={onPressTicket}
            />
          </ShowingListItemContainer>
        )}
    </ScrollView>
  );
};
