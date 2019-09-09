import { format } from "date-fns";
import gql from "graphql-tag";
import * as React from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { useQuery } from "urql";
import {
  ShowingQuery,
  ShowingQuery_showing_admin,
  ShowingQueryVariables
} from "./__generated__/ShowingQuery";
import { showingDate } from "./lib/filterShowings";
import { padding } from "./style";

const moviePoster =
  "https://catalog.cinema-api.com/images/ncg-images/e1cf3dd601ec4f23b4231f901f7b3c29.jpg?version=11D63C967B3576D4D5DBDE2A3ACFA3AB&width=240";

const useShowingQuery = (showingId: string) =>
  useQuery<ShowingQuery, ShowingQueryVariables>({
    query: gql`
      query ShowingQuery($showingId: UUID!) {
        showing(id: $showingId) {
          date
          time
          admin {
            firstName
            lastName
            nick
          }
          location {
            name
          }
          movie {
            title
            poster
          }
          myTickets {
            id
          }
          participants {
            user {
              avatar
              firstName
              id
              lastName
              nick
            }
          }
        }
      }
    `,
    variables: { showingId }
  });

const formatUserNick = (user: ShowingQuery_showing_admin) => {
  if (user.nick) {
    return user.nick;
  } else {
    return `${user.firstName} ${user.lastName}`;
  }
};

const formatUserCompleteName = (user: ShowingQuery_showing_admin) => {
  if (user.nick) {
    return `${user.firstName} '${user.nick}' ${user.lastName}`;
  } else {
    return `${user.firstName} ${user.lastName}`;
  }
};

const GoldButton = ({
  onPress,
  text
}: {
  text: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress}>
    <View
      style={{
        backgroundColor: "#f8d859",
        paddingVertical: padding,
        paddingHorizontal: padding * 2,
        shadowColor: "black",
        shadowOpacity: 0.5,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "400" }}>{text}</Text>
    </View>
  </TouchableOpacity>
);

export const ShowingScreen: React.FC<
  NavigationInjectedProps<{ showingId: string }>
> = ({ navigation }) => {
  const showingId = navigation.state.params
    ? navigation.state.params.showingId
    : "undefined";

  const [{ data, error, fetching }, executeQuery] = useShowingQuery(showingId);

  if (!data) {
    return <ActivityIndicator />;
  }

  const { showing } = data;

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={fetching} onRefresh={executeQuery} />
      }
    >
      <View style={{ padding }}>
        <View style={{ flexDirection: "row", backgroundColor: "white" }}>
          <Image
            source={{
              uri: showing.movie.poster || moviePoster,
              height: 199,
              width: 134
            }}
          />
          <View style={{ padding, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "500" }}>
              {showing.movie.title}
            </Text>
            <Text>{format(showingDate(showing), "d MMM HH:mm")}</Text>
            <Text>{showing.location.name}</Text>
            <Text>Skapad av {formatUserNick(showing.admin)}</Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-start", marginVertical: padding * 3 }}>
          <GoldButton text={"Jag hänger på!"} onPress={() => {}} />
        </View>
        <View>
          <Text>{showing.participants.length} deltagare</Text>
          {showing.participants.map(participant => (
            <View
              key={participant.user.id}
              style={{
                flexDirection: "row",
                marginTop: 10,
                backgroundColor: "white",
                shadowRadius: 4,
                shadowColor: "black",
                shadowOpacity: 0.5,
                shadowOffset: { width: 0, height: 2 }
              }}
            >
              <Image
                source={{ uri: participant.user.avatar, width: 70, height: 70 }}
              />
              <Text
                style={{
                  padding,
                  fontSize: 18,
                  fontWeight: "300"
                }}
              >
                {formatUserCompleteName(participant.user)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
