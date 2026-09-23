import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Competition } from '../types';

type Props = {
  competition: Competition;
  acting: boolean;
  onRegister: () => void;
  onSubmit: () => void;
};

export function AppFooter({ competition, acting, onRegister, onSubmit }: Props) {
  const state = competition.userState;
  let label = 'Registration Unavailable';
  let icon: keyof typeof Ionicons.glyphMap = 'lock-closed-outline';
  let disabled = true;
  let action = onRegister;
  if (!state.isRegistered && state.registrationAllowed) {
    label = 'Register Now';
    icon = 'ticket-outline';
    disabled = false;
  } else if (state.submissionStatus === 'SUBMITTED') {
    label = 'Submission Uploaded';
    icon = 'checkmark-circle';
  } else if (state.isRegistered && state.submissionAllowed) {
    label = 'Upload Submission';
    icon = 'cloud-upload-outline';
    disabled = false;
    action = onSubmit;
  } else if (state.isRegistered) {
    label = competition.lifecycle === 'COMPLETED' ? 'Competition Completed' : 'Submission Not Open';
    icon = 'time-outline';
  } else if (competition.availability.isFull) {
    label = 'Competition Full';
  }

  return (
    <View style={styles.footer}>
      <Pressable disabled={disabled || acting} onPress={action} style={[styles.cta, disabled && styles.ctaDisabled]}>
        {acting ? <ActivityIndicator color={colors.white} /> : <Ionicons name={icon} size={20} color={colors.white} />}
        <Text style={styles.ctaText}>{label}</Text>
        {state.isRegistered && <Text style={styles.status}>Registered</Text>}
      </Pressable>
      <View style={styles.nav}>
        <Nav icon="home-outline" label="Home" />
        <Nav icon="compass-outline" label="Explore" />
        <View style={styles.create}><Ionicons name="add" size={27} color={colors.white} /></View>
        <Nav icon="trophy" label="Competitions" active />
        <Nav icon="person-outline" label="Profile" />
      </View>
    </View>
  );
}

function Nav({ icon, label, active }: { icon: keyof typeof Ionicons.glyphMap; label: string; active?: boolean }) {
  return (
    <View style={styles.navItem}>
      <Ionicons name={icon} size={21} color={active ? colors.primary : colors.muted} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 16, paddingTop: 10 },
  cta: { height: 50, borderRadius: 14, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaDisabled: { backgroundColor: '#789794' },
  ctaText: { color: colors.white, fontWeight: '900', fontSize: 15 },
  status: { color: '#D7FFFB', fontSize: 10, borderLeftWidth: 1, borderLeftColor: '#A4D4D0', paddingLeft: 8 },
  nav: { height: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  navItem: { width: 62, alignItems: 'center', gap: 3 },
  navText: { color: colors.muted, fontSize: 9 },
  navTextActive: { color: colors.primary, fontWeight: '800' },
  create: { width: 45, height: 45, borderRadius: 23, marginTop: -18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.white },
});
