import { Text, View } from "react-native";

export default function About() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>About this application</Text>
      <Text>This app is designed to help you track your depot activities.</Text>
    </View>
  );
}