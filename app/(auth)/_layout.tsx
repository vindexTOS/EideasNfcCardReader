import { Stack } from "expo-router";

export default function TabLayout() {
  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>  
   
      <Stack.Screen name="index" />
    </Stack>
  );
}