import { DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { initDatabase } from '@/db/sqlite';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const setupDb = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };
    setupDb();
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading Database...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider value={DefaultTheme}>
          <AnimatedSplashOverlay />
          <Tabs
            screenOptions={{
              headerShown: true,
              tabBarActiveTintColor: '#4F46E5', // Indigo-600
              tabBarInactiveTintColor: '#94A3B8', // Slate-400
              tabBarStyle: {
                borderTopWidth: 1,
                borderTopColor: '#F1F5F9', // Slate-100
                elevation: 0,
                shadowOpacity: 0,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
              }
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Tasks',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="checkmark-done-circle" size={size || 24} color={color} />
                )
              }}
            />
            <Tabs.Screen
              name="categories"
              options={{
                title: 'Categories',
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="grid" size={size || 24} color={color} />
                )
              }}
            />
            <Tabs.Screen
              name="task/[id]"
              options={{ href: null, title: 'Task Detail' }}
            />
          </Tabs>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
