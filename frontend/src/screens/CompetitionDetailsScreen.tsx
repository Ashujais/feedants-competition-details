import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppFooter } from '../components/AppFooter';
import { CompetitionSummary, Countdown, ImportantDates, JudgeCard } from '../components/CompetitionCards';
import { CompetitionTabs, PaymentCard, ReferralCard, RewardsList, UserFeedback, WinnersCarousel } from '../components/ContentSections';
import { SubmissionModal } from '../components/SubmissionModal';
import { useCompetition } from '../hooks/useCompetition';
import { competitionApi } from '../services/api';
import { colors } from '../theme';

export function CompetitionDetailsScreen() {
  const { competition, loading, acting, error, refresh, runAction, clearError } = useCompetition();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [submissionOpen, setSubmissionOpen] = useState(false);

  const register = async () => {
    clearError();
    if (await runAction(competitionApi.register)) Alert.alert('You are registered', 'Your spot is confirmed for this demo competition.');
  };
  const submit = async (title: string, mediaUrl: string) => {
    clearError();
    if (await runAction(() => competitionApi.submit(title, mediaUrl))) {
      setSubmissionOpen(false);
      Alert.alert('Submission received', 'Your performance is ready for judging.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <View style={styles.brandMark}><Text style={styles.brandF}>f</Text></View>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading competition...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!competition) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorState}>
          <Ionicons name="cloud-offline-outline" size={45} color={colors.primary} />
          <Text style={styles.errorTitle}>Could not load competition</Text>
          <Text style={styles.errorText}>{error ?? 'Please check your connection.'}</Text>
          <Pressable onPress={() => refresh()} style={styles.retry}><Text style={styles.retryText}>Try Again</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" style={styles.back}><Ionicons name="arrow-back" size={21} color={colors.ink} /><Text style={styles.backText}>Go back</Text></Pressable>
        <View style={styles.language}>
          <Pressable onPress={() => setLanguage('en')} style={[styles.langItem, language === 'en' && styles.langActive]}><Text style={[styles.langText, language === 'en' && styles.langActiveText]}>ENG</Text></Pressable>
          <Pressable onPress={() => setLanguage('hi')} style={[styles.langItem, language === 'hi' && styles.langActive]}><Text style={[styles.langText, language === 'hi' && styles.langActiveText]}>{'\u0939\u093f\u0902\u0926\u0940'}</Text></Pressable>
        </View>
      </View>
      {error ? (
        <Pressable onPress={clearError} style={styles.banner}><Ionicons name="alert-circle-outline" color={colors.white} size={18} /><Text style={styles.bannerText}>{error}</Text><Ionicons name="close" color={colors.white} size={17} /></Pressable>
      ) : null}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CompetitionSummary competition={competition} onRegister={register} acting={acting} />
        <JudgeCard judge={competition.judge} />
        {new Date(competition.registrationEnd).getTime() > Date.now() ? (
          <Countdown target={competition.registrationEnd} onComplete={() => void refresh(true)} />
        ) : (
          <View style={styles.closed}><Ionicons name="time-outline" size={19} color={colors.muted} /><Text style={styles.closedText}>Registration has closed</Text></View>
        )}
        <ImportantDates competition={competition} />
        <WinnersCarousel winners={competition.previousWinners} />
        <CompetitionTabs content={competition.content} />
        <RewardsList rewards={competition.rewards} />
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.disclaimerText}><Text style={styles.disclaimerBold}>Disclaimer: </Text>Only contributions from paid participants will be considered for judging.</Text>
        </View>
        <PaymentCard payment={competition.paymentInfo} />
        <ReferralCard referral={competition.referral} />
        <UserFeedback reviews={competition.reviews} />
        <View style={styles.ad}><Text style={styles.adText}>Ad Here</Text></View>
        <Text style={styles.languageNote}>
          {language === 'hi' ? 'Interface labels can be localized; competition copy remains publisher-provided.' : 'Competition details are supplied by the organizer.'}
        </Text>
      </ScrollView>
      <AppFooter competition={competition} acting={acting} onRegister={register} onSubmit={() => setSubmissionOpen(true)} />
      <SubmissionModal visible={submissionOpen} busy={acting} onClose={() => setSubmissionOpen(false)} onSubmit={submit} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { height: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  back: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  backText: { color: colors.ink, fontWeight: '700' },
  language: { flexDirection: 'row', borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 3 },
  langItem: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  langActive: { backgroundColor: colors.primary },
  langText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  langActiveText: { color: colors.white },
  content: { padding: 16, paddingBottom: 24, gap: 18, width: '100%', maxWidth: 620, alignSelf: 'center' },
  banner: { backgroundColor: colors.danger, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, gap: 8 },
  bannerText: { color: colors.white, flex: 1, fontSize: 12 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  brandMark: { width: 56, height: 56, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  brandF: { color: colors.white, fontWeight: '900', fontSize: 34 },
  loadingText: { color: colors.muted, fontWeight: '600' },
  errorState: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center' },
  errorTitle: { color: colors.ink, fontWeight: '900', fontSize: 21, marginTop: 14 },
  errorText: { color: colors.muted, textAlign: 'center', marginTop: 7, lineHeight: 20 },
  retry: { backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 25, paddingVertical: 12, marginTop: 18 },
  retryText: { color: colors.white, fontWeight: '900' },
  closed: { flexDirection: 'row', justifyContent: 'center', gap: 8, padding: 14, backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.line },
  closedText: { color: colors.muted, fontWeight: '700' },
  disclaimer: { flexDirection: 'row', gap: 8, padding: 13, backgroundColor: colors.primarySoft, borderRadius: 13 },
  disclaimerText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 18 },
  disclaimerBold: { color: colors.ink, fontWeight: '800' },
  ad: { height: 90, borderWidth: 1, borderStyle: 'dashed', borderColor: '#B7C2C8', borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F4F5' },
  adText: { color: colors.muted, fontWeight: '700' },
  languageNote: { color: colors.muted, fontSize: 10, textAlign: 'center' },
});
