import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useUser } from '../lib/auth';
import { useRoutes } from '../features/routes/api/get-routes';
import React from 'react';

export default function Tab() {

  const user = useUser();
  const routes = useRoutes().data || {};
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>Tab [Home|Settings]</Text>
      <Text>Welcome {user.data?.username}!</Text>
      {/* {Object.keys(routes).map((key) => (
        <React.Fragment key={key}>
          <Text>Route ID: {routes[key].name}</Text>
        </React.Fragment>
      ))} */}
      <Text>Routes:</Text>
      {Object.keys(routes).length > 0 ? (
        <Image source={{ uri: "https://depot.douvk.co.uk/api/img_thumb/" + routes[Object.keys(routes)[0]].id + ".webp" , width: 64,
          height: 64}} />
      ) : (
        <Text>No routes available</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
