import * as React from "react";
import { Text, View } from "react-native";

export const RedHeader: React.FC = ({ children }) => (
  <View>
    <Text
      style={{
        color: "#4a4a4a",
        fontSize: 18,
        fontWeight: "500",
        paddingBottom: 5
      }}
    >
      {children}
    </Text>
    <View style={{ backgroundColor: "#d0021b", flex: 1, height: 4 }}/>
  </View>
);
