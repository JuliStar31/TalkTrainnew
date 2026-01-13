import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Colors, Spacing, BorderRadius } from '../lib/theme';
import { useAuth } from '../lib/auth';
import { getSkills, getWeeklyProgress } from '../lib/database';
import type { UserSkill, DailyProgress } from '../lib/supabase';

const screenWidth = Dimensions.get('window').width;

interface DashboardProps {
  onStartTraining: () => void;
  onTeleprompterMode: () => void;
  onSpeakingFeedback: () => void;
}

export default function DashboardScreen({ 
  onStartTraining, 
  onTeleprompterMode, 
  onSpeakingFeedback 
}: DashboardProps) {
  const { profile, user, signOut } = useAuth();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const skillsData = await getSkills();
        setSkills(skillsData);

        const progressData = await getWeeklyProgress();
        setWeeklyProgress(progressData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Format chart data
  const chartData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      labels.push(dayName);
      const progress = weeklyProgress.find(p => p.date === dateStr);
      data.push(progress?.average_score || 0);
    }

    return { labels, data };
  })();

  // Format skills data
  const skillsData = [
    { skill: 'Clarity', score: skills.find(s => s.skill_name === 'clarity')?.score || 0, color: Colors.primary },
    { skill: 'Pace', score: skills.find(s => s.skill_name === 'pace')?.score || 0, color: Colors.success },
    { skill: 'Confidence', score: skills.find(s => s.skill_name === 'confidence')?.score || 0, color: Colors.secondary },
    { skill: 'Vocabulary', score: skills.find(s => s.skill_name === 'vocabulary')?.score || 0, color: Colors.cyan },
  ];

  const formatPracticeTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TalkTrainer</Text>
          <Text style={styles.subtitle}>
            {profile?.full_name ? `Welcome back, ${profile.full_name}!` : 'Your AI Speaking Coach'}
          </Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <Feather name="log-out" size={20} color={Colors.gray[500]} />
        </TouchableOpacity>
      </View>

      {/* Overall Score Card */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.scoreCard}
      >
        <View style={styles.scoreContent}>
          <View>
            <Text style={styles.scoreLabel}>Overall Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreValue}>{profile?.overall_score || 0}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
          </View>
          <View style={styles.awardCircle}>
            <Feather name="award" size={40} color={Colors.white} />
          </View>
        </View>
        <View style={styles.scoreFooter}>
          <Feather name="trending-up" size={16} color={Colors.primaryLight} />
          <Text style={styles.scoreFooterText}>
            {profile?.total_sessions === 0 
              ? 'Start your first session!' 
              : `${profile?.total_sessions || 0} sessions completed`}
          </Text>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.primaryBg }]}>
            <Feather name="clock" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.statLabel}>Practice Time</Text>
            <Text style={styles.statValue}>
              {formatPracticeTime(profile?.total_practice_time || 0)}
            </Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.successLight }]}>
            <Feather name="target" size={20} color={Colors.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Sessions</Text>
            <Text style={styles.statValue}>{profile?.total_sessions || 0}</Text>
          </View>
        </View>
      </View>

      {/* Weekly Progress Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="trending-up" size={20} color={Colors.primary} />
          <Text style={styles.cardTitle}>Weekly Progress</Text>
        </View>
        {weeklyProgress.length === 0 ? (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>No data yet. Start your first session!</Text>
          </View>
        ) : (
          <LineChart
            data={{
              labels: chartData.labels,
              datasets: [{ data: chartData.data.map(d => d || 0) }],
            }}
            width={screenWidth - 64}
            height={180}
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: Colors.white,
              backgroundGradientFrom: Colors.white,
              backgroundGradientTo: Colors.white,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: Colors.primary,
              },
            }}
            bezier
            style={styles.chart}
          />
        )}
      </View>

      {/* Skills Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="zap" size={20} color={Colors.primary} />
          <Text style={styles.cardTitle}>Skills Breakdown</Text>
        </View>
        {skillsData.map((skill) => (
          <View key={skill.skill} style={styles.skillItem}>
            <View style={styles.skillHeader}>
              <Text style={styles.skillName}>{skill.skill}</Text>
              <Text style={[styles.skillScore, { color: skill.color }]}>{skill.score}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${skill.score}%`, backgroundColor: skill.color }
                ]} 
              />
            </View>
          </View>
        ))}
        {skillsData.every(s => s.score === 0) && (
          <Text style={styles.emptyText}>Complete your first session to see your skills!</Text>
        )}
      </View>

      {/* Practice Modes */}
      <Text style={styles.sectionTitle}>Practice Modes</Text>
      <View style={styles.modesGrid}>
        <TouchableOpacity style={styles.modeCard} onPress={onTeleprompterMode}>
          <LinearGradient
            colors={[Colors.cyan, '#0891b2']}
            style={styles.modeIcon}
          >
            <Feather name="file-text" size={24} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.modeName}>Teleprompter</Text>
          <Text style={styles.modeDesc}>Practice with scrolling text</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modeCard} onPress={onSpeakingFeedback}>
          <LinearGradient
            colors={[Colors.secondary, '#7c3aed']}
            style={styles.modeIcon}
          >
            <Feather name="activity" size={24} color={Colors.white} />
          </LinearGradient>
          <Text style={styles.modeName}>Filler Analysis</Text>
          <Text style={styles.modeDesc}>View detailed feedback</Text>
        </TouchableOpacity>
      </View>

      {/* Start Training Button */}
      <TouchableOpacity style={styles.startButton} onPress={onStartTraining}>
        <Feather name="mic" size={20} color={Colors.white} />
        <Text style={styles.startButtonText}>Start Training Session</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primaryBg,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.gray[600],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    marginTop: 2,
  },
  logoutButton: {
    padding: Spacing.sm,
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
    marginBottom: Spacing.md,
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
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  scoreMax: {
    fontSize: 24,
    color: Colors.primaryLight,
    marginLeft: 4,
  },
  awardCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreFooterText: {
    color: Colors.primaryLight,
    fontSize: 14,
  },
  statsGrid: {
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
  },
  chart: {
    marginLeft: -16,
    borderRadius: 16,
  },
  emptyChart: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.gray[400],
    fontSize: 14,
    textAlign: 'center',
  },
  skillItem: {
    marginBottom: Spacing.md,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  skillName: {
    fontSize: 14,
    color: Colors.gray[700],
  },
  skillScore: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  modesGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  modeCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modeName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 2,
  },
  modeDesc: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: Spacing.lg,
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
  startButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
