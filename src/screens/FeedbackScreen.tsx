import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '../lib/theme';

interface FeedbackScreenProps {
  sessionData: any;
  onBackToDashboard: () => void;
}

export default function FeedbackScreen({ sessionData, onBackToDashboard }: FeedbackScreenProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const metricsData = [
    { name: 'Clarity', score: sessionData?.clarity || 90, color: Colors.primary },
    { name: 'Pace', score: sessionData?.pace || 85, color: Colors.success },
    { name: 'Confidence', score: sessionData?.confidence || 88, color: Colors.secondary },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Session Complete! 🎉</Text>
        <Text style={styles.subtitle}>Here's how you performed</Text>
      </View>

      {/* Overall Score */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.scoreCard}
      >
        <View style={styles.scoreContent}>
          <View>
            <Text style={styles.scoreLabel}>Session Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreValue}>{sessionData?.overallScore || 88}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <View style={styles.excellentRow}>
              <Feather name="trending-up" size={16} color={Colors.primaryLight} />
              <Text style={styles.excellentText}>Excellent performance!</Text>
            </View>
          </View>
          <View style={styles.awardCircle}>
            <Feather name="award" size={48} color={Colors.white} />
          </View>
        </View>
      </LinearGradient>

      {/* Session Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.primaryBg }]}>
            <Feather name="clock" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.statLabel}>Duration</Text>
            <Text style={styles.statValue}>{formatTime(sessionData?.duration || 65)}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#f3e8ff' }]}>
            <Feather name="message-square" size={20} color={Colors.secondary} />
          </View>
          <View>
            <Text style={styles.statLabel}>WPM</Text>
            <Text style={styles.statValue}>{sessionData?.wordsPerMinute || 145}</Text>
          </View>
        </View>
      </View>

      {/* Performance Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance Breakdown</Text>
        {metricsData.map((metric) => (
          <View key={metric.name} style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricName}>{metric.name}</Text>
              <Text style={[styles.metricScore, { color: metric.color }]}>{metric.score}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${metric.score}%`, backgroundColor: metric.color }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      {/* AI Insights */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="zap" size={20} color={Colors.warning} />
          <Text style={styles.cardTitle}>AI Insights & Tips</Text>
        </View>
        {sessionData?.tips?.map((tip: string, index: number) => (
          <View 
            key={index}
            style={[
              styles.tipItem,
              { backgroundColor: index % 2 === 0 ? Colors.successLight : Colors.primaryBg }
            ]}
          >
            <Feather 
              name={index % 2 === 0 ? "check-circle" : "info"} 
              size={20} 
              color={index % 2 === 0 ? Colors.success : Colors.primary} 
            />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Filler Words */}
      <View style={[styles.card, { backgroundColor: Colors.warningLight }]}>
        <View style={styles.fillerHeader}>
          <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
            <Feather name="message-square" size={20} color={Colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fillerTitle}>Filler Words Detected</Text>
            <Text style={styles.fillerCount}>
              {sessionData?.fillerWords || 12} instances of "um", "uh", "like"
            </Text>
            <Text style={styles.fillerTip}>
              Try pausing briefly instead of using filler words
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.primaryButton} onPress={onBackToDashboard}>
          <Text style={styles.primaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onBackToDashboard}>
          <Text style={styles.secondaryButtonText}>Start New Session</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 4,
  },
  scoreCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    color: Colors.primaryLight,
    fontSize: 14,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scoreMax: {
    fontSize: 28,
    color: Colors.primaryLight,
    marginLeft: 4,
  },
  excellentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
  },
  excellentText: {
    color: Colors.primaryLight,
    fontSize: 14,
  },
  awardCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[500],
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.gray[900],
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: Spacing.md,
  },
  metricItem: {
    marginBottom: Spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  metricName: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  metricScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray[700],
    lineHeight: 20,
  },
  fillerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  fillerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  fillerCount: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  fillerTip: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  buttons: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md + 4,
    alignItems: 'center',
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
});
