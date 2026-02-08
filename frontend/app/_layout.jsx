import { Stack } from 'expo-router';
import { UserProvider } from '../lib/context/UserContext';

export default function Layout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ animation: 'slide_from_bottom' }} />
    </UserProvider>
  );
}
