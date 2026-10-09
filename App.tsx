import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';

import { CalculatorProvider, useCalculator } from './src/context/CalculatorContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { Header } from './src/components/Header';
import { Display } from './src/components/Display';
import { Keypad } from './src/components/Keypad';
import { ScientificKeypad } from './src/components/ScientificKeypad';
import { HistoryModal } from './src/components/HistoryModal';
import { SettingsModal } from './src/components/SettingsModal';
import { OnboardingModal, ONBOARDING_STORAGE_KEY } from './src/components/OnboardingModal';
import { QuickTourModal } from './src/components/QuickTourModal';

const MainCalculatorScreen: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => {
  const { state } = useCalculator();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 12),
          paddingBottom: Math.max(insets.bottom, 12),
          paddingLeft: Math.max(insets.left, 8),
          paddingRight: Math.max(insets.right, 8),
        },
      ]}
    >
      <StatusBar style={theme.isLight ? 'dark' : 'light'} />
      <Header onOpenSettings={onOpenSettings} />
      <Display />
      {state.mode === 'scientific' ? <ScientificKeypad /> : <Keypad />}
      <HistoryModal />
    </View>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });

  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isQuickTourVisible, setIsQuickTourVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function checkFirstTimeUser() {
      try {
        const hasSeen = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!hasSeen) {
          setIsOnboardingVisible(true);
        }
      } catch (err) {
        console.error('Error reading onboarding key', err);
      } finally {
        setIsReady(true);
      }
    }
    checkFirstTimeUser();
  }, []);

  const handleOnboardingFinish = (startTour: boolean = true) => {
    setIsOnboardingVisible(false);
    if (startTour) {
      setTimeout(() => {
        setIsQuickTourVisible(true);
      }, 300);
    }
  };

  if (!fontsLoaded || !isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CalculatorProvider>
          <MainCalculatorScreen onOpenSettings={() => setIsSettingsVisible(true)} />
          <SettingsModal
            visible={isSettingsVisible}
            onClose={() => setIsSettingsVisible(false)}
            onOpenQuickTour={() => setIsQuickTourVisible(true)}
          />
          <OnboardingModal
            visible={isOnboardingVisible}
            onFinish={handleOnboardingFinish}
          />
          <QuickTourModal
            visible={isQuickTourVisible}
            onClose={() => setIsQuickTourVisible(false)}
          />
        </CalculatorProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#07090E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
