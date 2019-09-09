import * as React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const moviePoster =
  "https://catalog.cinema-api.com/images/ncg-images/e1cf3dd601ec4f23b4231f901f7b3c29.jpg?version=11D63C967B3576D4D5DBDE2A3ACFA3AB&width=240";

export const ShowingListItem: React.FC<{ onPressShowTicket: () => void }> = ({
                                                                               onPressShowTicket
                                                                             }) => (
  <View
    style={{
      padding,
      backgroundColor: "white",
      borderRadius: 5,
      marginBottom: 8,
      flexDirection: "row"
    }}
  >
    <Image source={{ uri: moviePoster, height: 199, width: 134 }}/>
    <View style={{ paddingHorizontal: padding, flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          Once upon a time in Hollywood
        </Text>
        <Text>11 jan 19:30</Text>
        <Text>Bergakungen, salong 13</Text>
      </View>
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
    </View>
    <View>
      <Text>{">"}</Text>
    </View>
  </View>
);
