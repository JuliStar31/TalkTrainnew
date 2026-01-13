import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FillerWord {
  time: number;
  word: string;
  position: number;
}

interface SpeakingFeedbackScreenProps {
  onBack: () => void;
}

export default function SpeakingFeedbackScreen({ onBack }: SpeakingFeedbackScreenProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const duration = 65; // seconds

  // Mock filler word detections
  const fillerWords: FillerWord[] = [
    { time: 8, word: 'um', position: 12 },
    { time: 15, word: 'uh', position: 23 },
    { time: 23, word: 'like', position: 35 },
    { time: 31, word: 'um', position: 48 },
    { time: 42, word: 'uh', position: 65 },
    { time: 51, word: 'um', position: 78 },
    { time: 58, word: 'like', position: 89 },
  ];

  const progress = useSharedValue(0);
  const playheadPulse = useSharedValue(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  useEffect(() => {
    progress.value = withTiming(currentTime / duration, { duration: 100 });
  }, [currentTime]);

  useEffect(() => {
    if (isPlaying) {
      playheadPulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      playheadPulse.value = withTiming(1);
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentFillerWord = fillerWords.find(
    (fw) => Math.abs(fw.time - currentTime) < 0.5
  );

  const animatedPlayheadStyle = useAnimatedStyle(() => ({
    left: `${progress.value * 100}%`,
    transform: [{ scale: playheadPulse.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.title}>Speaking Analysis</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Filler Word Warning */}
        {currentFillerWord && (
          <Animated.View
            style={[
              styles.warningCard,
              {
                opacity: currentFillerWord ? withTiming(1) : withTiming(0),
                transform: [{ scale: currentFillerWord ? withTiming(1) : withTiming(0.95) }],
              },
            ]}
          >
            <LinearGradient
              colors={['#fee2e2', '#ffffff']}
              style={styles.warningGradient}
            >
              <View style={styles.warningContent}>
                <Feather name="alert-triangle" size={32} color="#dc2626" />
                <View style={styles.warningTextContainer}>
                  <Text style={styles.warningTitle}>Filler word detected!</Text>
                  <Text style={styles.warningDesc}>
                    Avoid using "{currentFillerWord.word}" - try pausing instead
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Speech Timeline Card */}
        <View style={styles.timelineCard}>
          <Text style={styles.cardTitle}>Speech Timeline</Text>

          <View style={styles.waveformContainer}>
            {/* Waveform Bars */}
            <View style={styles.waveform}>
              {Array.from({ length: 80 }).map((_, index) => {
                const time = (index / 80) * duration;
                const hasFiller = fillerWords.some(
                  (fw) => Math.abs(fw.time - time) < 0.8
                );
                const isPast = time <= currentTime;
                const height = Math.random() * 60 + 20;

                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.bar,
                      {
                        height: `${height}%`,
                        backgroundColor: hasFiller
                          ? '#ef4444'
                          : isPast
                          ? '#3b82f6'
                          : '#d1d5db',
                      },
                    ]}
                  />
                );
              })}
            </View>

            {/* Playhead */}
            <Animated.View style={[styles.playhead, animatedPlayheadStyle]}>
              <View style={styles.playheadDot} />
            </Animated.View>

            {/* Filler Markers */}
            {fillerWords.map((fw, index) => (
              <View
                key={index}
                style={[
                  styles.fillerMarker,
                  { left: `${(fw.time / duration) * 100}%` },
                ]}
              />
            ))}
          </View>

          {/* Time & Controls */}
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayPause}
            >
              <Feather
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color="white"
              />
              <Text style={styles.playText}>
                {isPlaying
                  ? 'Pause Replay'
                  : currentTime >= duration
                  ? 'Replay'
                  : 'Play'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
              <Text style={styles.restartText}>Restart</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Filler Words Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.cardHeader}>
            <Feather name="alert-triangle" size={20} color="#f59e0b" />
            <Text style={styles.cardTitle}>Filler Words Detected</Text>
          </View>

          <View style={styles.summaryContent}>
            <View style={styles.countContainer}>
              <Text style={styles.countNumber}>{fillerWords.length}</Text>
              <Text style={styles.countLabel}>instances found</Text>
            </View>

            <View style={styles.fillerList}>
              {fillerWords.map((fw, index) => (
                <View key={index} style={styles.fillerTag}>
                  <Text style={styles.fillerText}>
                    "{fw.word}" at {formatTime(fw.time)}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.tipRow}>
              <Feather name="x-circle" size={20} color="#ef4444" />
              <Text style={styles.tipText}>
                Filler words like "um", "uh", and "like" can distract your audience
              </Text>
            </View>

            <View style={styles.tipRow}>
              <Feather name="check-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>
                Try pausing briefly instead - silence is more powerful than filler words
              </Text>
            </View>
          </View>
        </View>

        {/* AI Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.cardHeader}>
            <Feather name="lightbulb" size={20} color="#eab308" />
            <Text style={styles.cardTitle}>AI Tips for Improvement</Text>
          </View>

          <View style={styles.tipsContent}>
            <View style={styles.tipItem}>
              <Feather name="trending-up" size={20} color="#3b82f6" />
              <View>
                <Text style={styles.tipTitle}>Practice with a metronome</Text>
                <Text style={styles.tipDesc}>
                  Maintaining a steady rhythm reduces the need for filler words
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Feather name="check-circle" size={20} color="#8b5cf6" />
              <View>
                <Text style={styles.tipTitle}>Embrace the pause</Text>
                <Text style={styles.tipDesc}>
                  A brief silence gives you time to think and adds emphasis
                </Text>
              </View>
            </View>

            <View style={styles.tipItem}>
              <Feather name="lightbulb" size={20} color="#10b981" />
              <View>
                <Text style={styles.tipTitle}>Record yourself regularly</Text>
                <Text style={styles.tipDesc}>
                  Awareness is the first step - keep tracking your progress
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  transform: [
                    {
                      scale: withRepeat(
                        withSequence(
                          withTiming(1.5, { duration: 1500 }),
                          withTiming(1, { duration: 1500 })
                        ),
                        -1,
                        true
                      ),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  warningCard: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fca5a5',
  },
  warningGradient: {
    padding: 20,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
  },
  warningDesc: {
    fontSize: 14,
    color: '#991b1b',
    marginTop: 4,
  },
  timelineCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  waveformContainer: {
    height: 128,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
  },
  playhead: {
    position: 'absolute',
    width: 4,
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    zIndex: 10,
  },
  playheadDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  fillerMarker: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: '100%',
    backgroundColor: '#ef4444',
    opacity: 0.3,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  playText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  restartButton: {
    height: 48,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#bfdbfe',
    borderRadius: 20,
    justifyContent: 'center',
  },
  restartText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryContent: {
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    padding: 20,
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  countNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#c2410c',
  },
  countLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  fillerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  fillerTag: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  fillerText: {
    fontSize: 14,
    color: '#c2410c',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  tipsContent: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 20,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 14,
    color: '#6b7280',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60a5fa',
  },
});