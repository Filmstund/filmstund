import gql from "graphql-tag";
import * as React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  View
} from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { useQuery } from "urql";
import {
  ShowingQuery,
  ShowingQuery_showing_myTickets,
  ShowingQueryVariables
} from "./__generated__/ShowingQuery";
import { sfSansRegular } from "./lib/assets/fonts";
import { padding } from "./style";

const Ticket = ({
  ticket,
  width
}: {
  width: number;
  ticket: ShowingQuery_showing_myTickets;
}) => (
  <View
    style={{
      flex: 1,
      width: width,
      height: 500,
      alignItems: "stretch",
      padding
    }}
  >
    <View
      style={{
        borderRadius: 20,
        backgroundColor: "black",
        margin: padding,
        paddingTop: 40,
        flex: 1,
        alignItems: "center"
      }}
    >
      <View
        style={{
          borderRadius: 7,
          backgroundColor: "white",
          padding: 15
        }}
      >
        <Image source={{ uri: ticket.barcode, width: 128, height: 128 }} />
      </View>
      <View style={{ margin: padding * 4, alignItems: "center" }}>
        <Text
          style={{
            fontFamily: sfSansRegular,
            color: "white",
            fontSize: 30,
            fontWeight: "500"
          }}
        >
          {ticket.screen}
        </Text>
        <View style={{ flexDirection: "row", margin: padding }}>
          <Text
            style={{ fontFamily: sfSansRegular, color: "white", fontSize: 20 }}
          >
            Rad {ticket.seat.row}
          </Text>
          <Text
            style={{ fontFamily: sfSansRegular, color: "#7b7b7b", fontSize: 20 }}
          >
            {" "}
            |{" "}
          </Text>
          <Text
            style={{ fontFamily: sfSansRegular, color: "white", fontSize: 20 }}
          >
            Stolsnr {ticket.seat.number}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: sfSansRegular,
            color: "white",
            fontSize: 35,
            fontWeight: "500"
          }}
        >
          {ticket.customerType}
        </Text>
      </View>
      <Text
        style={{ fontFamily: sfSansRegular, color: "#7b7b7b", fontSize: 14 }}
      >
        {ticket.id}
      </Text>
    </View>
  </View>
);

export const TicketScreen: React.FC<
  NavigationInjectedProps<{ showingId: string }>
> = ({ navigation }) => {
  const showingId = navigation.state.params
    ? navigation.state.params.showingId
    : "undefined";
  const [{ data, error, fetching }, executeQuery] = useQuery<
    ShowingQuery,
    ShowingQueryVariables
  >({
    query: gql`
      query ShowingQuery($showingId: UUID!) {
        showing(id: $showingId) {
          movie {
            title
          }
          myTickets {
            customerType
            barcode
            id
            screen
            seat {
              number
              row
            }
            profileId
          }
        }
      }
    `,
    variables: { showingId }
  });

  if (!data || fetching) {
    return <ActivityIndicator />;
  }

  const { width } = Dimensions.get("window");

  return (
    <View>
      <ScrollView horizontal pagingEnabled>
        {data.showing.myTickets.map(ticket => (
          <Ticket key={ticket.id} width={width} ticket={ticket} />
        ))}
      </ScrollView>
      <View
        style={{
          backgroundColor: "#f3f5f8",
          paddingVertical: padding,
          paddingHorizontal: padding * 2
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: padding
          }}
        >
          <Text>Biograf</Text>
          <Text style={{ fontWeight: "600" }}>Filmstaden Bergakungen</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: padding
          }}
        >
          <Text>Datum</Text>
          <Text style={{ fontWeight: "600" }}>2019-08-22</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: padding
          }}
        >
          <Text>Tid</Text>
          <Text style={{ fontWeight: "600" }}>19:30</Text>
        </View>
      </View>
    </View>
  );
};
