import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { queryConfig } from "./lib/react-query";

export default function RootLayout() {
  
  const queryClient = new QueryClient({
    defaultOptions: queryConfig,
  });

  
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}