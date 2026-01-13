import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TeleprompterModeProps {
  onBack: () => void;
}

const sampleScripts = {
  en: `Welcome everyone. Today I want to share with you an exciting opportunity that will transform the way we think about communication.

Public speaking is not just about words. It's about connection, confidence, and clarity. Each time we speak, we have the power to inspire, to educate, and to make a lasting impact.

The journey to becoming a great speaker starts with practice. It starts with being willing to step outside your comfort zone and embrace the challenge of expressing your ideas clearly and confidently.

Remember, every expert was once a beginner. Every confident speaker once felt nervous. The difference is that they kept practicing, kept improving, and never gave up on their goal to communicate effectively.

As we move forward, I encourage you to embrace every opportunity to speak. Whether it's in a meeting, a presentation, or a casual conversation, each moment is a chance to refine your skills.

Thank you for your time and attention. Let's continue this journey together, supporting each other as we grow into the communicators we aspire to be.`,

  id: `Selamat datang semuanya. Hari ini saya ingin berbagi dengan Anda peluang menarik yang akan mengubah cara kita berpikir tentang komunikasi.

Berbicara di depan umum bukan hanya tentang kata-kata. Ini tentang koneksi, kepercayaan diri, dan kejelasan. Setiap kali kita berbicara, kita memiliki kekuatan untuk menginspirasi, mendidik, dan membuat dampak yang bertahan lama.

Perjalanan untuk menjadi pembicara yang hebat dimulai dengan latihan. Ini dimulai dengan kemauan untuk keluar dari zona nyaman Anda dan merangkul tantangan mengekspresikan ide-ide Anda dengan jelas dan percaya diri.

Ingatlah, setiap ahli pernah menjadi pemula. Setiap pembicara yang percaya diri pernah merasa gugup. Perbedaannya adalah mereka terus berlatih, terus meningkatkan diri, dan tidak pernah menyerah pada tujuan mereka untuk berkomunikasi secara efektif.

Saat kita melangkah maju, saya mendorong Anda untuk memanfaatkan setiap kesempatan untuk berbicara. Baik itu dalam rapat, presentasi, atau percakapan santai, setiap momen adalah kesempatan untuk mengasah keterampilan Anda.

Terima kasih atas waktu dan perhatian Anda. Mari kita lanjutkan perjalanan ini bersama-sama, saling mendukung saat kita tumbuh menjadi komunikator yang kita cita-citakan.`,
};

export default function TeleprompterMode({ onBack }: TeleprompterModeProps) {
  const [language, setLanguage] = useState<'en' | 'id'>('en');
  const [topicInput, setTopicInput] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const [showScriptView, setShowScriptView] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [speed, setSpeed] = useState(50); // 10-100
  const [elapsedTime, setElapsedTime] = useState(0);
  const [recordingData, setRecordingData] = useState<any>(null);

  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);
  const pulse = useSharedValue(1);

  const currentScript = generatedScript || sampleScripts[language];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying || isRecording) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRecording]);

  useEffect(() => {
    if (isPlaying) {
      const scroll = () => {
        scrollY.value += speed / 100;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ y: scrollY.value, animated: false });
          // Cek kalau sudah sampai akhir (mock max scroll)
          if (scrollY.value > currentScript.length * 2) { // approx
            setIsPlaying(false);
            setHasFinished(true);
          }
        }
      };
      const id = setInterval(scroll, 16); // ~60fps
      return () => clearInterval(id);
    }
  }, [isPlaying, speed, currentScript]);

  useEffect(() => {
    if (isPlaying) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [isPlaying]);

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handlePlayPause = () => {
    if (hasFinished && !isPlaying) {
      scrollY.value = 0;
      setHasFinished(false);
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    scrollY.value = 0;
    setElapsedTime(0);
    setHasFinished(false);
  };

  const handleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsPlaying(false);

      // Mock review data setelah recording
      const mockData = {
        duration: elapsedTime,
        overallScore: Math.floor(Math.random() * 15) + 85,
        clarity: Math.floor(Math.random() * 15) + 85,
        pace: Math.floor(Math.random() * 15) + 80,
        confidence: Math.floor(Math.random() * 15) + 85,
        tips: language === 'en' ? [
          'Excellent use of the teleprompter! Pace matched scroll speed well.',
          'Clarity was strong - good pronunciation throughout.',
          'Consider varying tone for emphasis on key points.',
          'Volume consistent and clear - great job!'
        ] : [
          'Penggunaan teleprompter luar biasa! Kecepatan sesuai dengan guliran.',
          'Kejelasan bagus - pengucapan jelas sepanjang sesi.',
          'Pertimbangkan variasi nada untuk menekankan poin penting.',
          'Volume konsisten dan jelas - kerja bagus!'
        ]
      };

      setRecordingData(mockData);
      setShowReview(true);
    } else {
      setIsRecording(true);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  const handleGenerateScript = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const templates = {
        en: [
          `Good ${new Date().getHours() < 12 ? 'morning' : 'afternoon'} everyone. Today, I'm excited to talk about ${topicInput || 'this topic'}.

${topicInput || 'This topic'} is fascinating and relevant today. Let's explore why it matters and how we can apply it in our lives.

First, it offers opportunities for growth. Second, it challenges our thinking. Third, it drives positive change.

In conclusion, embracing ${topicInput || 'this topic'} can transform our perspective. Thank you!`,
          // tambah template lain kalau mau
        ],
        id: [
          `Selamat ${new Date().getHours() < 12 ? 'pagi' : 'siang'} semuanya. Hari ini saya senang membahas tentang ${topicInput || 'topik ini'}.

${topicInput || 'Topik ini'} sangat menarik dan relevan saat ini. Mari kita bahas mengapa penting dan bagaimana menerapkannya.

Pertama, memberikan peluang pertumbuhan. Kedua, menantang cara berpikir kita. Ketiga, mendorong perubahan positif.

Kesimpulannya, merangkul ${topicInput || 'topik ini'} bisa mengubah pandangan kita. Terima kasih!`,
        ]
      };

      const randomTemplate = templates[language][Math.floor(Math.random() * templates[language].length)];
      setGeneratedScript(randomTemplate);
      setIsGenerating(false);
    }, 2000);
  };

  const handleStartPractice = () => {
    setShowScriptView(true);
    scrollY.value = 0;
    setElapsedTime(0);
    setHasFinished(false);
  };

  const handleBackToSetup = () => {
    setShowScriptView(false);
    setShowReview(false);
    setIsPlaying(false);
    setIsRecording(false);
    scrollY.value = 0;
    setElapsedTime(0);
    setHasFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // AI Review Screen setelah recording
  if (showReview && recordingData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToSetup} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#2563eb" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {language === 'en' ? 'AI Review' : 'Tinjauan AI'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Overall Score */}
          <View style={styles.scoreCard}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.scoreGradient}
            >
              <View style={styles.scoreContent}>
                <View>
                  <Text style={styles.scoreLabel}>
                    {language === 'en' ? 'Overall Score' : 'Skor Keseluruhan'}
                  </Text>
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreValue}>{recordingData.overallScore}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>
                  <View style={styles.excellentRow}>
                    <Feather name="trending-up" size={16} color="#bfdbfe" />
                    <Text style={styles.excellentText}>
                      {language === 'en' ? 'Excellent performance!' : 'Performa luar biasa!'}
                    </Text>
                  </View>
                </View>
                <View style={styles.awardCircle}>
                  <Feather name="award" size={48} color="white" />
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.cardHeader}>
              <Feather name="lightbulb" size={20} color="#eab308" />
              <Text style={styles.cardTitle}>
                {language === 'en' ? 'AI Insights & Tips' : 'Wawasan & Tips AI'}
              </Text>
            </View>
            <View style={styles.tipsContent}>
              {recordingData.tips.map((tip: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.tipItem,
                    index % 2 === 0 ? styles.tipGreen : styles.tipBlue,
                  ]}
                >
                  <Feather
                    name={index % 2 === 0 ? 'check-circle' : 'alert-circle'}
                    size={20}
                    color={index % 2 === 0 ? '#10b981' : '#3b82f6'}
                  />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToSetup}
            >
              <Text style={styles.buttonText}>
                {language === 'en' ? 'Back to Dashboard' : 'Kembali ke Dashboard'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleBackToSetup}
            >
              <Text style={styles.secondaryButtonText}>
                {language === 'en' ? 'Practice Again' : 'Latihan Lagi'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Teleprompter Setup + Script View
  if (!showScriptView) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#2563eb" />
            </TouchableOpacity>
            <Text style={styles.title}>
              {language === 'en' ? 'Teleprompter Setup' : 'Pengaturan Teleprompter'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Language */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="globe" size={20} color="#3b82f6" />
              <Text style={styles.cardTitle}>
                {language === 'en' ? 'Language' : 'Bahasa'}
              </Text>
            </View>
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'en' && styles.activeButton,
                ]}
                onPress={() => setLanguage('en')}
              >
                <Text style={[
                  styles.languageText,
                  language === 'en' && styles.activeText,
                ]}>
                  English
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageButton,
                  language === 'id' && styles.activeButton,
                ]}
                onPress={() => setLanguage('id')}
              >
                <Text style={[
                  styles.languageText,
                  language === 'id' && styles.activeText,
                ]}>
                  Bahasa Indonesia
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Topic Input */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="file-text" size={20} color="#3b82f6" />
              <Text style={styles.cardTitle}>
                {language === 'en' ? 'Your Topic' : 'Topik Anda'}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder={
                language === 'en'
                  ? 'e.g., Climate change, AI technology...'
                  : 'contoh: Perubahan iklim, Teknologi AI...'
              }
              value={topicInput}
              onChangeText={setTopicInput}
              multiline
              numberOfLines={4}
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              style={[
                styles.generateButton,
                (!topicInput || isGenerating) && styles.disabledButton,
              ]}
              onPress={handleGenerateScript}
              disabled={!topicInput || isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Feather name="sparkles" size={20} color="white" />
                  <Text style={styles.generateText}>
                    {language === 'en' ? 'Generate Script with AI' : 'Buat Naskah dengan AI'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Preview Generated Script */}
          {generatedScript && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {language === 'en' ? 'Generated Script' : 'Naskah yang Dibuat'}
                </Text>
                <TouchableOpacity onPress={() => setGeneratedScript('')}>
                  <Text style={styles.clearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.previewScroll}>
                <Text style={styles.previewText}>{generatedScript}</Text>
              </ScrollView>

              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartPractice}
              >
                <Feather name="play" size={20} color="white" />
                <Text style={styles.startText}>
                  {language === 'en' ? 'Start Practice' : 'Mulai Latihan'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Default Script Option */}
          {!generatedScript && (
            <TouchableOpacity
              style={styles.defaultCard}
              onPress={handleStartPractice}
            >
              <Text style={styles.defaultText}>
                {language === 'en' ? 'Use Default Script' : 'Gunakan Naskah Default'}
              </Text>
              <Feather name="play" size={20} color="#3b82f6" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Teleprompter Screen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackToSetup} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#0891b2" />
        </TouchableOpacity>
        <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scriptContainer}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.scriptPadding}>
          <Text style={styles.scriptText}>{currentScript}</Text>
        </View>
      </ScrollView>

      {/* Guide Line */}
      <Animated.View style={[styles.guideLine, animatedPulseStyle]} />

      {/* Speed Control */}
      <View style={styles.speedControl}>
        <View style={styles.speedHeader}>
          <Feather name="gauge" size={20} color="#0891b2" />
          <Text style={styles.speedText}>Speed: {speed}%</Text>
        </View>
        <View style={styles.speedButtons}>
          <TouchableOpacity
            style={styles.speedBtn}
            onPress={() => setSpeed(Math.max(10, speed - 10))}
          >
            <Text style={styles.speedBtnText}>-</Text>
          </TouchableOpacity>

          <View style={styles.sliderTrack}>
            <Animated.View
              style={[
                styles.sliderFill,
                { width: `${speed}%` },
              ]}
            />
          </View>

          <TouchableOpacity
            style={styles.speedBtn}
            onPress={() => setSpeed(Math.min(100, speed + 10))}
          >
            <Text style={styles.speedBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <Animated.View style={styles.recordingPulse} />
          <Text style={styles.recordingText}>Recording...</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handlePlayPause}
        >
          <Feather name={isPlaying ? 'pause' : 'play'} size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={handleReset}
        >
          <Feather name="rotate-ccw" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlBtn,
            isRecording && styles.recordingBtn,
          ]}
          onPress={handleRecording}
        >
          <Feather name="mic" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  timer: {
    fontSize: 24,
    fontWeight: '600',
    color: '#22d3ee',
  },
  scriptContainer: {
    flex: 1,
  },
  scriptPadding: {
    padding: 32,
    paddingTop: 100,
    paddingBottom: 300,
  },
  scriptText: {
    fontSize: 28,
    lineHeight: 42,
    color: '#e0f2fe',
    textAlign: 'center',
  },
  guideLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#22d3ee',
    top: '50%',
  },
  speedControl: {
    padding: 16,
    backgroundColor: '#1e293b',
  },
  speedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  speedText: {
    color: '#22d3ee',
    fontSize: 16,
    fontWeight: '600',
  },
  speedButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speedBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedBtnText: {
    fontSize: 24,
    color: '#22d3ee',
    fontWeight: 'bold',
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#22d3ee',
    borderRadius: 4,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#7f1d1d',
  },
  recordingPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  recordingText: {
    color: '#fca5a5',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    backgroundColor: '#0f172a',
  },
  controlBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0891b2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0891b2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  // Review Screen Styles
  scoreCard: {
    margin: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  scoreGradient: {
    padding: 32,
  },
  scoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#bfdbfe',
    fontSize: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreMax: {
    fontSize: 32,
    color: '#bfdbfe',
  },
  excellentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  excellentText: {
    color: '#bfdbfe',
    fontSize: 16,
  },
  awardCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ... tambah styles lain sesuai kebutuhan (tipsCard, buttons, dll.)
});