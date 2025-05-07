import { View, Text, StyleSheet,  TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

export default function Tab() {

  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const signIn = async ({ username, password }: { username: string; password: string }) => {

    const formDataToSend = new FormData();
    formDataToSend.append("username", username);
    formDataToSend.append("password", password);
    fetch("https://depot.douvk.co.uk/api/auth/jwt/login", {
      method: "POST",
      body: formDataToSend,
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else if (response.status === 400) {
          return response.json().then((errorData) => {
            if (errorData.detail === "LOGIN_BAD_CREDENTIALS") {
              // setError(true);
            }
            // throw new Error(errorData.detail);
          });
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then(async (data) => {
        console.log("Success:", data);
        await AsyncStorage.setItem("token", data.access_token);
        // props.onSuccess(data.access_token);
        // window.location.href = "/";
      })
      .catch((error) => {
        console.error(error);
      });
  };
  
  
  return (
    <View>
        <Text>Login</Text>
        <TextInput
        placeholder="Email"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button onPress={() => signIn({ username, password })} title="Sign in" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
