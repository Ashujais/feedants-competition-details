import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (title: string, mediaUrl: string) => Promise<void>;
};

export function SubmissionModal({ visible, busy, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [validation, setValidation] = useState('');
  useEffect(() => {
    if (!visible) { setTitle(''); setMediaUrl(''); setValidation(''); }
  }, [visible]);
  const submit = async () => {
    if (title.trim().length < 2 || !/^https?:\/\//i.test(mediaUrl.trim())) {
      setValidation('Enter a title and a valid public http(s) video link.');
      return;
    }
    setValidation('');
    await onSubmit(title.trim(), mediaUrl.trim());
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Upload Submission</Text>
          <Text style={styles.help}>For this demo, provide a public video link. Production storage is intentionally out of scope.</Text>
          <Text style={styles.label}>Performance title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="My Kathak performance" style={styles.input} maxLength={120} />
          <Text style={styles.label}>Public video URL</Text>
          <TextInput value={mediaUrl} onChangeText={setMediaUrl} placeholder="https://..." style={styles.input} autoCapitalize="none" keyboardType="url" />
          {validation ? <Text style={styles.validation}>{validation}</Text> : null}
          <View style={styles.actions}>
            <Pressable onPress={onClose} disabled={busy} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable onPress={submit} disabled={busy} style={styles.submit}><Text style={styles.submitText}>{busy ? 'Uploading...' : 'Submit Entry'}</Text></Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(7, 20, 32, 0.55)' },
  sheet: { backgroundColor: colors.white, padding: 20, paddingBottom: 32, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handle: { width: 42, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: colors.line, marginBottom: 16 },
  title: { color: colors.ink, fontSize: 22, fontWeight: '900' },
  help: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 6, marginBottom: 18 },
  label: { color: colors.ink, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 13, height: 48, color: colors.ink, marginBottom: 14, backgroundColor: colors.background },
  validation: { color: colors.danger, fontSize: 12, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancel: { flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  submit: { flex: 2, height: 48, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.ink, fontWeight: '800' },
  submitText: { color: colors.white, fontWeight: '900' },
});
