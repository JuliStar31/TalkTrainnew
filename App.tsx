import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/lib/auth';
import { Colors } from './src/lib/theme';

import AuthScreen from './src/screens/AuthScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TrainingSessionScreen from './src/screens/TrainingSessionScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';

type ScreenType = 'dashboard' | 'training' | 'feedback' | 'teleprompter' | 'speakingFeedback';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [sessionData, setSessionData] = useState<any>(null);

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Authenticated - show app screens
  const handleStartTraining = () => setCurrentScreen('training');
  
  const handleEndSession = (data: any) => {
    setSessionData(data);
    setCurrentScreen('feedback');
  };

  const handleBackToDashboard = () => setCurrentScreen('dashboard');
  
  const handleTeleprompterMode = () => {
    // TODO: Implement teleprompter screen
    console.log('Teleprompter mode');
  };

  const handleSpeakingFeedback = () => {
    // TODO: Implement speaking feedback screen
    console.log('Speaking feedback');
  };

  switch (currentScreen) {
    case 'training':
      return (
        <TrainingSessionScreen 
          onEndSession={handleEndSession} 
          onBack={handleBackToDashboard}
        />
      );
    case 'feedback':
      return (
        <FeedbackScreen 
          sessionData={sessionData} 
          onBackToDashboard={handleBackToDashboard} 
        />
      );
    default:
      return (
        <DashboardScreen
          onStartTraining={handleStartTraining}
          onTeleprompterMode={handleTeleprompterMode}
          onSpeakingFeedback={handleSpeakingFeedback}
        />
      );
  }
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
  },
});
