/**
 * ChallengeAttemptSheet — the photo-proof capture sheet for one challenge.
 *
 * Shows the challenge's validation prompt, lets the explorer take a photo (or pick one
 * from their library while testing), and submits it for AI validation via
 * `useAttemptChallenge`. Approved/Rejected feedback (toast + reward beacon) is owned by
 * the hook; this sheet just closes on approval and stays open to retry on rejection.
 *
 * The library option is gated behind `ALLOW_LIBRARY_PICK` so it can be turned off after
 * testing (a real "prove you're here" challenge should force a live capture) without
 * touching the flow.
 */
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImagePlus, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Icon, LabelCaps, Text } from '../../../shared/components';
import { BeaconButton } from '../../../shared/layout';
import { useTheme } from '../../../shared/theme';
import { useAttemptChallenge } from '../hooks/useAttemptChallenge';
import type { AttemptMedia } from '../api/checkInChallengeApi';
import type { Challenge } from '../api/schemas';

/** Flip to `false` after testing to force a live camera capture only. */
const ALLOW_LIBRARY_PICK = true;

interface ChallengeAttemptSheetProps {
  visible: boolean;
  challenge: Challenge;
  checkInId: string;
  /** Reuse an existing (Pending/Rejected) attempt instead of creating a new link. */
  existingAttemptId?: string | null;
  onClose: () => void;
}

export function ChallengeAttemptSheet({
  visible,
  challenge,
  checkInId,
  existingAttemptId,
  onClose,
}: ChallengeAttemptSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation('places');
  const attempt = useAttemptChallenge();
  const [media, setMedia] = useState<AttemptMedia | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const reset = () => {
    setMedia(null);
    setPermissionDenied(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setMedia({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' });
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setMedia({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' });
  };

  const submit = async () => {
    if (!media) return;
    const approved = await attempt
      .mutateAsync({ challengeId: challenge.id, checkInId, media, existingAttemptId })
      .catch(() => null);
    // Approved → the moment is celebrated by the hook; close the sheet. Rejected (false)
    // → keep the sheet open so the explorer can retry with a better photo.
    if (approved === true) close();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={styles.backdrop}>
        <SafeAreaView edges={['bottom']} style={styles.sheetWrap}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.surfaceContainerLowest }]}>
            <View style={styles.header}>
              <LabelCaps className="text-primary">{t('challenges.attemptEyebrow')}</LabelCaps>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel={t('detail.close')}
                hitSlop={8}
              >
                <Icon icon={X} size={22} color={theme.colors.onSurfaceVariant} />
              </Pressable>
            </View>

            <Text variant="headlineSmall" className="text-on-surface font-bold" numberOfLines={2}>
              {challenge.name}
            </Text>
            {challenge.validationPrompt ? (
              <Text variant="bodyMedium" className="text-on-surface-variant">
                {challenge.validationPrompt}
              </Text>
            ) : null}

            <Pressable
              onPress={takePhoto}
              accessibilityRole="button"
              accessibilityLabel={t('challenges.takePhoto')}
              style={[styles.preview, { backgroundColor: theme.colors.surfaceContainerHigh }]}
            >
              {media ? (
                <Image source={{ uri: media.uri }} style={styles.previewImage} resizeMode="cover" />
              ) : (
                <View style={styles.previewEmpty}>
                  <Icon icon={Camera} size={28} color={theme.colors.primary} strokeWidth={1.8} />
                  <LabelCaps className="text-on-surface-variant">
                    {t('challenges.takePhoto')}
                  </LabelCaps>
                </View>
              )}
            </Pressable>

            {ALLOW_LIBRARY_PICK ? (
              <Pressable
                onPress={pickFromLibrary}
                accessibilityRole="button"
                accessibilityLabel={t('challenges.chooseFromLibrary')}
                style={styles.libraryRow}
              >
                <Icon icon={ImagePlus} size={16} color={theme.colors.onSurfaceVariant} />
                <LabelCaps className="text-on-surface-variant">
                  {t('challenges.chooseFromLibrary')}
                </LabelCaps>
              </Pressable>
            ) : null}

            {permissionDenied ? (
              <Text variant="bodyMedium" className="text-on-surface-variant">
                {t('challenges.permissionDenied')}
              </Text>
            ) : null}

            <BeaconButton
              label={attempt.isPending ? t('challenges.submitting') : t('challenges.submitPhoto')}
              onPress={submit}
              disabled={!media || attempt.isPending}
              className={!media || attempt.isPending ? 'opacity-50' : ''}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 14, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    borderRadius: 12,
    height: 200,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewEmpty: {
    alignItems: 'center',
    gap: 8,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 4,
  },
});
