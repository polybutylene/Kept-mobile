"use client";

import { Stack } from "expo-router";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import * as SecureStore from "expo-secure-store";
import { useMemo } from "react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

const convex = new ConvexReactClient(convexUrl ?? "");

const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export default function RootLayout() {
  const storageNamespace = useMemo(
    () => (convexUrl ? convexUrl.replace(/[^a-zA-Z0-9]/g, "") : "kept"),
    [],
  );

  if (!convexUrl) {
    return (
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
          initialParams={{ error: "Missing EXPO_PUBLIC_CONVEX_URL" }}
        />
      </Stack>
    );
  }

  return (
    <ConvexAuthProvider
      client={convex}
      storage={secureStoreAdapter}
      storageNamespace={storageNamespace}
      replaceURL={() => {}}
      shouldHandleCode={false}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ConvexAuthProvider>
  );
}
