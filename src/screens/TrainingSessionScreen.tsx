import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../lib/theme';

interface TrainingSessionProps {
  onEndSession: (data: any) => void;
  onBack: () => void;
}

export default function TrainingSessionScreen({ onEndSession, onBack }: TrainingSessionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const handleFinishSession = () => {
    const sessionData = {
      duration: recordingTime,
      overallScore: Math.floor(Math.random() * 15) + 85,
      clarity: Math.floor(Math.random() * 15) + 85,
      pace: Math.floor(Math.random() * 15) + 80,
      confidence: Math.floor(Math.random() * 15) + 85,
      fillerWords: Math.floor(Math.random() * 10) + 5,
      wordsPerMinute: Math.floor(Math.random() * 30) + 130,
      tips: [
        'Great job maintaining consistent pace throughout!',
        'Try to reduce filler words like "um" and "uh"',
        'Your clarity has improved significantly',
        'Consider varying your tone for emphasis'
      ]
    };
    onEndSession(sessionData);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.gray[700]} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Training Session</Text>
          <Text style={styles.subtitle}>Practice your speech naturally</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Recording Interface */}
      <View style={styles.content}>
        <View style={styles.card}>
          {/* Microphone Animation */}
          <View style={styles.micContainer}>
            <Animated.View style={[styles.micPulse, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.micCircle}
              >
                <Feather name="mic" size={60} color={Colors.white} />
              </LinearGradient>
            </Animated.View>
            {isRecording && (
              <>
                <View style={[styles.ripple, styles.ripple1]} />
                <View style={[styles.ripple, styles.ripple2]} />
              </>
            )}
          </View>

          {/* Timer */}
          <Text style={styles.timer}>{formatTime(recordingTime)}</Text>

          {/* Status */}
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, isRecording && styles.statusDotActive]} />
            <Text style={styles.statusText}>
              {isRecording ? 'Recording in progress...' : hasRecorded ? 'Recording complete' : 'Ready to record'}
            </Text>
          </View>

          {/* Tips */}
          {!isRecording && !hasRecorded && (
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Feather name="volume-2" size={20} color={Colors.primary} />
                <Text style={styles.tipsTitle}>Quick tips before you start:</Text>
              </View>
              <Text style={styles.tipItem}>• Speak clearly and at a natural pace</Text>
              <Text style={styles.tipItem}>• Find a quiet environment</Text>
              <Text style={styles.tipItem}>• Practice for at least 30 seconds</Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttons}>
            {!isRecording && !hasRecorded && (
              <TouchableOpacity style={styles.primaryButton} onPress={handleStartRecording}>
                <Feather name="play" size={20} color={Colors.white} />
                <Text style={styles.primaryButtonText}>Start Recording</Text>
              </TouchableOpacity>
            )}

            {isRecording && (
              <TouchableOpacity style={styles.stopButton} onPress={handleStopRecording}>
                <Feather name="square" size={20} color={Colors.white} />
                <Text style={styles.stopButtonText}>Stop Recording</Text>
              </TouchableOpacity>
            )}

            {hasRecorded && !isRecording && (
              <>
                <TouchableOpacity style={styles.primaryButton} onPress={handleFinishSession}>
                  <Text style={styles.primaryButtonText}>Get AI Feedback</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleStartRecording}>
                  <Text style={styles.secondaryButtonText}>Record Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Real-time Indicators */}
        {isRecording && (
          <View style={styles.indicators}>
            <View style={[styles.indicator, { backgroundColor: Colors.successLight }]}>
              <Text style={styles.indicatorLabel}>Volume</Text>
              <Text style={[styles.indicatorValue, { color: Colors.success }]}>Good</Text>
            </View>
            <View style={[styles.indicator, { backgroundColor: Colors.primaryBg }]}>
              <Text style={styles.indicatorLabel}>Clarity</Text>
              <Text style={[styles.indicatorValue, { color: Colors.primary }]}>Excellent</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  micContainer: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  micPulse: {
    zIndex: 2,
  },
  micCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.primaryLight,
    opacity: 0.3,
    zIndex: 1,
  },
  ripple1: {
    transform: [{ scale: 1.3 }],
  },
  ripple2: {
    transform: [{ scale: 1.6 }],
    opacity: 0.15,
  },
  timer: {
    fontSize: 56,
    fontWeight: '300',
    color: Colors.gray[900],
    fontVariant: ['tabular-nums'],
    marginBottom: Spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[400],
  },
  statusDotActive: {
    backgroundColor: Colors.danger,
  },
  statusText: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  tipsContainer: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[700],
  },
  tipItem: {
    fontSize: 14,
    color: Colors.gray[600],
    marginLeft: Spacing.xl,
    marginBottom: 4,
  },
  buttons: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stopButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  indicators: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  indicator: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 12,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 20,
    fontWeight: '600',
  },
});
