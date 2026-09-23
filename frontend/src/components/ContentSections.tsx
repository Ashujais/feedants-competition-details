import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import type { Competition } from '../types';
import { money } from '../utils/format';

export function WinnersCarousel({ winners }: { winners: Competition['previousWinners'] }) {
  return (
    <View>
      <View style={styles.headingRow}><Text style={styles.sectionTitle}>Previous Winners</Text><Text style={styles.seeAll}>See all</Text></View>
      {winners.length === 0 ? <Empty text="Winners will appear after results are announced." /> : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.winners}>
          {winners.map((winner, index) => (
            <View key={`${winner.name}-${index}`} style={styles.winnerCard}>
              <Image source={{ uri: winner.imageUrl }} style={styles.winnerImage} />
              <View style={styles.play}><Ionicons name="play" size={14} color={colors.white} /></View>
              <Text numberOfLines={1} style={styles.winnerName}>{winner.name}</Text>
              <Text style={styles.winnerPosition}>{winner.position}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

type Tab = 'about' | 'judging' | 'rules';
export function CompetitionTabs({ content }: { content: Competition['content'] }) {
  const [tab, setTab] = useState<Tab>('about');
  const [expanded, setExpanded] = useState(false);
  const tabs: { key: Tab; label: string }[] = [
    { key: 'about', label: 'About Competition' },
    { key: 'judging', label: 'Judging Parameters' },
    { key: 'rules', label: 'Rules & Eligibility' },
  ];
  const renderContent = () => {
    if (tab === 'about') {
      return (
        <>
          <Text numberOfLines={expanded ? undefined : 3} style={styles.body}>{content.about}</Text>
          <Pressable onPress={() => setExpanded((value) => !value)}><Text style={styles.viewMore}>{expanded ? 'View less' : 'View more'}</Text></Pressable>
        </>
      );
    }
    const items = tab === 'judging' ? content.judgingParameters : [...content.rules, ...content.eligibility];
    return items.length ? items.map((item) => <Text key={item} style={styles.listItem}>{'\u2022'}  {item}</Text>) : <Empty text="Details are not available yet." />;
  };
  return (
    <View style={styles.infoCard}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {tabs.map((item) => (
          <Pressable key={item.key} onPress={() => { setTab(item.key); setExpanded(false); }} style={[styles.tab, tab === item.key && styles.activeTab]}>
            <Text style={[styles.tabText, tab === item.key && styles.activeTabText]}>{item.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.tabBody}>{renderContent()}</View>
    </View>
  );
}

export function RewardsList({ rewards }: { rewards: Competition['rewards'] }) {
  return (
    <View>
      <View style={styles.headingRow}><Text style={styles.sectionTitle}>Rewards</Text><Text style={styles.subtle}>(All Positions)</Text></View>
      {rewards.length === 0 ? <Empty text="Rewards are being finalized." /> : (
        <View style={styles.rewardCard}>
          {rewards.map((reward, index) => (
            <View key={reward.position} style={[styles.rewardRow, index !== rewards.length - 1 && styles.rewardDivider]}>
              <View style={[styles.medal, reward.position <= 3 && styles.medalTop]}>
                <Ionicons name={reward.position <= 3 ? 'medal' : 'star'} size={18} color={reward.position <= 3 ? colors.gold : colors.primary} />
              </View>
              <Text style={styles.rewardLabel}>{reward.label}</Text>
              <Text style={styles.rewardAmount}>{money(reward.amount)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function ReferralCard({ referral }: { referral: Competition['referral'] }) {
  const copy = async () => {
    await Clipboard.setStringAsync(referral.url);
    Alert.alert('Copied', 'Referral link copied to clipboard.');
  };
  const share = () => Share.share({ message: `Join me on Feedants: ${referral.url}`, url: referral.url });
  return (
    <View style={styles.referral}>
      <View style={styles.referralHeader}>
        <View style={styles.referralIcon}><Ionicons name="gift" size={24} color={colors.white} /></View>
        <View style={styles.flex}><Text style={styles.referralTitle}>Refer & Earn more discount</Text><Text style={styles.referralEarning}>{referral.earningText}</Text></View>
      </View>
      <Text numberOfLines={1} style={styles.link}>{referral.url}</Text>
      <View style={styles.buttonRow}>
        <Pressable onPress={copy} style={styles.outlineButton}><Ionicons name="copy-outline" size={17} color={colors.primary} /><Text style={styles.outlineText}>Copy Link</Text></Pressable>
        <Pressable onPress={share} style={styles.solidButton}><Ionicons name="share-social-outline" size={17} color={colors.white} /><Text style={styles.solidText}>Refer Now</Text></Pressable>
      </View>
    </View>
  );
}

export function PaymentCard({ payment }: { payment: Competition['paymentInfo'] }) {
  return (
    <View style={styles.paymentCard}>
      <View style={styles.paymentTop}>
        <View style={styles.paymentIcon}><Ionicons name="wallet-outline" size={23} color={colors.primary} /></View>
        <View style={styles.flex}><Text style={styles.paymentTitle}>How will you receive prize money?</Text><Text style={styles.paymentText}>{payment.prizeDelivery}</Text></View>
      </View>
      <Pressable onPress={() => Linking.openURL(payment.explainerVideoUrl)} style={styles.watchButton}>
        <Ionicons name="play-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.watchText}>Watch video to know more</Text>
      </Pressable>
      <View style={styles.policy}><Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} /><Text style={styles.policyText}>{payment.refundPolicy}</Text></View>
      <Text style={styles.secure}>Secure payments powered by {payment.provider}</Text>
    </View>
  );
}

export function UserFeedback({ reviews }: { reviews: Competition['reviews'] }) {
  const review = reviews[0];
  return (
    <View style={styles.feedback}>
      <View><Text style={styles.feedbackTitle}>Hear From Our Users</Text><Text style={styles.feedbackSub}>See what participants say about Feedants</Text></View>
      <Ionicons name="arrow-forward-circle" size={34} color={colors.primary} />
      {review ? <Text style={styles.srOnly}>{review.quote}</Text> : null}
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return <View style={styles.empty}><Ionicons name="sparkles-outline" size={20} color={colors.muted} /><Text style={styles.emptyText}>{text}</Text></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  headingRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  seeAll: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  subtle: { color: colors.muted, fontSize: 12 },
  winners: { gap: 11, paddingRight: 4 },
  winnerCard: { width: 132, backgroundColor: colors.white, borderRadius: 15, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, paddingBottom: 10 },
  winnerImage: { width: '100%', height: 142, backgroundColor: colors.line },
  play: { position: 'absolute', top: 108, right: 9, width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  winnerName: { color: colors.ink, fontWeight: '800', paddingHorizontal: 10, marginTop: 9 },
  winnerPosition: { color: colors.primary, fontSize: 11, fontWeight: '700', paddingHorizontal: 10, marginTop: 2 },
  infoCard: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 17, overflow: 'hidden' },
  tabs: { paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { paddingVertical: 14, paddingHorizontal: 11, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.primary },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  activeTabText: { color: colors.primaryDark },
  tabBody: { padding: 16, minHeight: 122 },
  body: { color: colors.ink, lineHeight: 22, fontSize: 14 },
  viewMore: { color: colors.primary, fontWeight: '800', marginTop: 8 },
  listItem: { color: colors.ink, lineHeight: 22, marginBottom: 6, fontSize: 14 },
  rewardCard: { backgroundColor: colors.white, borderRadius: 17, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14 },
  rewardRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13 },
  rewardDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  medal: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  medalTop: { backgroundColor: '#FFF6DE' },
  rewardLabel: { flex: 1, color: colors.ink, fontWeight: '700', marginLeft: 11 },
  rewardAmount: { color: colors.primaryDark, fontSize: 16, fontWeight: '900' },
  referral: { padding: 17, borderRadius: 19, backgroundColor: '#E8F7F5', borderWidth: 1, borderColor: '#B9E0DC', gap: 12 },
  referralHeader: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  referralIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  referralTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  referralEarning: { color: colors.primaryDark, marginTop: 2, fontSize: 12 },
  link: { backgroundColor: colors.white, borderRadius: 10, padding: 11, color: colors.muted, fontSize: 12 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  outlineButton: { flex: 1, height: 43, borderRadius: 11, borderWidth: 1, borderColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  solidButton: { flex: 1, height: 43, borderRadius: 11, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  outlineText: { color: colors.primary, fontWeight: '800' },
  solidText: { color: colors.white, fontWeight: '800' },
  paymentCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 17, padding: 16, gap: 13 },
  paymentTop: { flexDirection: 'row', gap: 11 },
  paymentIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  paymentTitle: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  paymentText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  watchButton: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  watchText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  policy: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: colors.background, borderRadius: 11, padding: 11 },
  policyText: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 },
  secure: { color: colors.primaryDark, fontSize: 11, fontWeight: '700', textAlign: 'center' },
  feedback: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16, justifyContent: 'space-between' },
  feedbackTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  feedbackSub: { color: colors.muted, fontSize: 11, marginTop: 3 },
  srOnly: { position: 'absolute', opacity: 0 },
  empty: { flexDirection: 'row', gap: 8, padding: 15, borderRadius: 13, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  emptyText: { flex: 1, color: colors.muted, fontSize: 13 },
});
