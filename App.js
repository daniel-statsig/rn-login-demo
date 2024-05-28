import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { StatsigClient } from "@statsig/js-client";
import {
  StatsigProviderRN,
  useExperiment,
  useStatsigClient, // StatsigProvider specifically for RN
  warmCachingFromAsyncStorage,
} from "@statsig/react-native-bindings";

const INIT_STATSIG_USER = {
  appVersion: "1.2.3",
  country: "AE",
  userID: "null",
};

const STATSIG_OPTIONS = {
  environment: {
    tier: "staging",
  },
};

const myStatsigClient = new StatsigClient(
  "client-rfLvYGag3eyU0jYW5zcIJTQip7GXxSrhOFN69IGMjvq",
  INIT_STATSIG_USER,
  STATSIG_OPTIONS
);

myStatsigClient.on("*", (event) => console.log(event.name, event));

const warming = warmCachingFromAsyncStorage(myStatsigClient);

async function getStatsigUser() {
  await new Promise((r) => setTimeout(r, 1000)); // Mock Delay
  return Promise.resolve({ ...INIT_STATSIG_USER, userID: "a-user" });
}

function ExperimentCheck() {
  const config = useExperiment("an_experiment");
  return (
    <Text>
      {config.get("a_string", "fallback")} - {config.details.reason}
    </Text>
  );
}

function UpdateUserButton({ setIsLoading }) {
  const { client } = useStatsigClient();

  const handleLogin = async () => {
    setIsLoading(true);
    const userInfo = await getStatsigUser();
    await client.updateUserAsync(userInfo).catch((err) => console.error(err));
    setIsLoading(false);
  };

  return <Button title="Login" onPress={() => handleLogin()} />;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <StatsigProviderRN client={myStatsigClient} cacheWarming={warming}>
      <View style={styles.container}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <ExperimentCheck />
            <UpdateUserButton setIsLoading={setIsLoading} />
          </>
        )}
      </View>
    </StatsigProviderRN>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
