import * as React from "react";
import { Text, View } from "react-native";

export const EmptyList = ({ text }: { text: string }) => (
  <View
    style={{
      justifyContent: "center",
      alignItems: "center",
      height: 50
    }}
  >
    <Text style={{ color: "#9b9b9b" }}>{text}</Text>
  </View>
);
