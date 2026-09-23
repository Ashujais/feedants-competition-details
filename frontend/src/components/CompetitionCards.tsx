import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Competition } from '../types';
import { formatDate, formatTime, money } from '../utils/format';

type SummaryProps = {
  competition: Competition;
  onRegister: () => void;
  acting: boolean;
};

export function CompetitionSummary({ competition, onRegister, acting }: SummaryProps) {
  const progress = Math.min(competition.availability.registeredCount / competition.maxParticipants, 1);
  const registered = competition.userState.isRegistered;
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={styles.flex}>
          <Text style={styles.title}>{competition.title}</Text>
          <View style={styles.badges}>
            <Text style={styles.category}>{competition.category}</Text>
            {competition.badges.map((badge) => <Text key={badge} style={styles.badge}>{badge}</Text>)}
          </View>
        </View>
        <View style={styles.trophy}><Ionicons name="trophy" size={28} color={colors.gold} /></View>
      </View>
      <View style={styles.certificate}>
        <Ionicons name="ribbon-outline" size={18} color={colors.primary} />
        <Text style={styles.certificateText}>{competition.certificateText}</Text>
      </View>
      <View style={styles.moneyRow}>
        <View><Text style={styles.label}>Prize Pool</Text><Text style={styles.amount}>{money(competition.prizePool)}</Text></View>
        <View style={styles.divider} />
        <View><Text style={styles.label}>Entry Fee</Text><Text style={styles.amount}>{money(competition.entryFee)}</Text></View>
      </View>
      <View style={styles.availability}>
        <View style={styles.rowBetween}>
          <Text style={styles.spots}><Ionicons name="people" size={16} />  Only {competition.availability.remainingSpots} spots left</Text>
          <Text style={styles.booking}>{competition.availability.registeredCount} / {competition.maxParticipants} Booked</Text>
        </View>
        <View style={styles.track}><View style={[styles.progress, { width: `${Math.max(progress * 100, 3)}%` }]} /></View>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={registered || !competition.userState.registrationAllowed || acting}
        onPress={onRegister}
        style={[styles.registerButton, (registered || !competition.userState.registrationAllowed) && styles.registeredButton]}
      >
        <Ionicons name={registered ? 'checkmark-circle' : 'ticket-outline'} size={19} color={registered ? colors.primary : colors.white} />
        <Text style={[styles.registerText, registered && styles.registeredText]}>
          {registered ? 'Registered' : competition.userState.registrationAllowed ? 'Register Now' : competition.availability.isFull ? 'Competition Full' : 'Registration Unavailable'}
        </Text>
      </Pressable>
    </View>
  );
}

export function JudgeCard({ judge }: { judge: Competition['judge'] }) {
  return (
    <View style={styles.judgeCard}>
      <Image source={{ uri: judge.imageUrl }} style={styles.judgeImage} />
      <View style={styles.flex}>
        <Text style={styles.eyebrow}>JUDGE</Text>
        <Text style={styles.judgeName}>{judge.name}</Text>
        <Text style={styles.judgeTitle}>{judge.title}</Text>
        <Text style={styles.experience}>{judge.experience}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => Linking.openURL(judge.videoUrl)} style={styles.videoButton}>
        <Ionicons name="play" size={20} color={colors.white} />
        <Text style={styles.videoText}>Intro{String.fromCharCode(10)}Video</Text>
      </Pressable>
    </View>
  );
}

export function Countdown({ target, onComplete }: { target: string; onComplete: () => void }) {
  const [remaining, setRemaining] = useState(() => Math.max(new Date(target).getTime() - Date.now(), 0));
  useEffect(() => {
    const tick = () => {
      const next = Math.max(new Date(target).getTime() - Date.now(), 0);
      setRemaining(next);
      if (next === 0) onComplete();
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [target, onComplete]);
  const parts = useMemo(() => {
    const seconds = Math.floor(remaining / 1000);
    return [
      Math.floor(seconds / 86400),
      Math.floor((seconds % 86400) / 3600),
      Math.floor((seconds % 3600) / 60),
      seconds % 60,
    ].map((value) => String(value).padStart(2, '0'));
  }, [remaining]);
  return (
    <View style={styles.countdown}>
      <View style={styles.rowBetween}>
        <Text style={styles.countdownLabel}><MaterialCommunityIcons name="timer-sand" size={18} />  Registration closes in</Text>
        <Text style={styles.hurry}><Ionicons name="stopwatch-outline" size={17} /> Hurry up!</Text>
      </View>
      <Text style={styles.timer}>{parts[0]}d  :  {parts[1]}h  :  {parts[2]}m  :  {parts[3]}s</Text>
    </View>
  );
}

export function ImportantDates({ competition }: { competition: Competition }) {
  const dates = [
    { label: 'Register Before', value: competition.registrationEnd },
    { label: 'Submission Starts', value: competition.submissionStart },
    { label: 'Submission Ends', value: competition.submissionEnd },
    { label: 'Result Date', value: competition.resultDate },
  ];
  return (
    <View>
      <Text style={styles.sectionTitle}>Important Dates</Text>
      <View style={styles.datesGrid}>
        {dates.map(({ label, value }) => (
          <View key={label} style={styles.dateItem}>
            <View style={styles.dateIcon}><Ionicons name="calendar-outline" size={18} color={colors.primary} /></View>
            <Text style={styles.dateLabel}>{label}</Text>
            <Text style={styles.dateValue}>{formatDate(value)}</Text>
            <Text style={styles.dateTime}>{formatTime(value)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: colors.line, gap: 15 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flex: { flex: 1 },
  title: { color: colors.ink, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  badges: { flexDirection: 'row', gap: 7, marginTop: 9 },
  category: { backgroundColor: colors.primarySoft, color: colors.primaryDark, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, fontSize: 12, fontWeight: '700' },
  badge: { backgroundColor: '#FFF3D7', color: '#956600', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, fontSize: 12, fontWeight: '700' },
  trophy: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#FFF7E5', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  certificate: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  certificateText: { color: colors.primaryDark, fontSize: 13, fontWeight: '600' },
  moneyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 14, padding: 14 },
  divider: { height: 40, width: 1, backgroundColor: colors.line, marginHorizontal: 28 },
  label: { color: colors.muted, fontSize: 12, marginBottom: 4 },
  amount: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  availability: { gap: 8 },
  spots: { color: colors.primaryDark, fontWeight: '700', fontSize: 13 },
  booking: { color: colors.muted, fontSize: 12 },
  track: { height: 8, borderRadius: 8, backgroundColor: '#DCE8E7', overflow: 'hidden' },
  progress: { height: 8, borderRadius: 8, backgroundColor: colors.primary },
  registerButton: { height: 48, borderRadius: 13, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  registeredButton: { backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
  registerText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  registeredText: { color: colors.primaryDark },
  judgeCard: { flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 18, backgroundColor: colors.ink },
  judgeImage: { width: 76, height: 88, borderRadius: 14, backgroundColor: colors.line },
  eyebrow: { color: '#8FD9D4', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  judgeName: { color: colors.white, fontSize: 18, fontWeight: '800', marginTop: 2 },
  judgeTitle: { color: '#D7E1E8', fontSize: 12, marginTop: 2 },
  experience: { color: '#8FD9D4', fontSize: 11, fontWeight: '700', marginTop: 5 },
  videoButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 13, width: 58, height: 62 },
  videoText: { color: colors.white, fontSize: 10, textAlign: 'center', fontWeight: '700', marginTop: 2 },
  countdown: { backgroundColor: '#FFF8E8', borderRadius: 16, borderWidth: 1, borderColor: '#F7DEAC', padding: 15, gap: 12 },
  countdownLabel: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  hurry: { color: '#C27000', fontWeight: '800', fontSize: 12 },
  timer: { color: colors.ink, fontWeight: '900', fontSize: 24, letterSpacing: 1, textAlign: 'center' },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: 13 },
  datesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dateItem: { width: '48%', minHeight: 124, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 15, padding: 13 },
  dateIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  dateLabel: { color: colors.muted, fontSize: 11 },
  dateValue: { color: colors.ink, fontSize: 15, fontWeight: '800', marginTop: 3 },
  dateTime: { color: colors.primaryDark, fontSize: 12, fontWeight: '600', marginTop: 2 },
});
