import { ActivityIndicator, View, StyleSheet } from 'react-native';

// This screen is just a placeholder.
// The real logic is in the RootLayout in app/_layout.tsx.
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});