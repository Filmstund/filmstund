import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { ShowingsByMovieQuery_publicShowings } from "./__generated__/ShowingsByMovieQuery";
import { padding } from "./style";

const moviePoster =
  "https://catalog.cinema-api.com/images/ncg-images/e1cf3dd601ec4f23b4231f901f7b3c29.jpg?version=11D63C967B3576D4D5DBDE2A3ACFA3AB&width=240";

export const ShowingListItem: React.FC<{
  showing: ShowingsByMovieQuery_publicShowings;
  onPressShowTicket: () => void;
  onPressShowing: () => void;
}> = ({ onPressShowing, onPressShowTicket, showing }) => (
  <View
    style={{
      padding,
      backgroundColor: "white",
      borderRadius: 5,
      marginBottom: 8,
      flexDirection: "row"
    }}
  >
    <TouchableOpacity onPress={onPressShowing}>
      <Image
        source={{
          uri: showing.movie.poster || moviePoster,
          height: 199,
          width: 134
        }}
      />
    </TouchableOpacity>
    <View style={{ paddingHorizontal: padding, flex: 1 }}>
      <TouchableOpacity style={{ flex: 1 }} onPress={onPressShowing}>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          {showing.movie.title}
        </Text>
        <Text>
          {showing.date} {showing.time}
        </Text>
        <Text>{showing.location.name}</Text>
      </TouchableOpacity>
      {showing.myTickets &&
        showing.myTickets.length > 0 && (
          <View style={{ alignItems: "flex-start" }}>
            <TouchableOpacity onPress={onPressShowTicket}>
              <View
                style={{
                  backgroundColor: "#d0021b",
                  borderRadius: 5,
                  padding: 13
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "500"
                  }}
                >
                  Visa biljett
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
    </View>
    <View>
      <Text>{">"}</Text>
    </View>
  </View>
);
