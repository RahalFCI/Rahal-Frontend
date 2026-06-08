/**
 * ProfilePicturePicker — optional registration image picker.
 * Backend expects the selected file as multipart field `profilePicture`.
 */
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { tokens } from '../../../shared/theme';

export interface ProfilePictureFile {
  uri: string;
  name: string;
  type: string;
}

interface ProfilePicturePickerProps {
  label: string;
  actionLabel: string;
  changeLabel: string;
  helperText: string;
  permissionDeniedText: string;
  value?: ProfilePictureFile;
  onChange: (file?: ProfilePictureFile) => void;
  /** Absolute URL of the existing profile picture (from server). Shown when no new image is selected. */
  currentImageUrl?: string;
}

function fileNameFromUri(uri: string): string {
  const name = uri.split('/').pop();
  return name && name.includes('.') ? name : `profile-${Date.now()}.jpg`;
}

function mimeTypeFromName(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

export function ProfilePicturePicker({
  label,
  actionLabel,
  changeLabel,
  helperText,
  permissionDeniedText,
  value,
  onChange,
  currentImageUrl,
}: ProfilePicturePickerProps) {
  const [permissionDenied, setPermissionDenied] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const name = asset.fileName ?? fileNameFromUri(asset.uri);
    onChange({
      uri: asset.uri,
      name,
      type: asset.mimeType ?? mimeTypeFromName(name),
    });
  };

  return (
    <View className="gap-[4px]">
      <LabelCaps>{label}</LabelCaps>
      <Pressable
        onPress={pickImage}
        className="bg-surface-container-high rounded-sm px-[16px] py-[14px] min-h-[80px] flex-row items-center gap-[12px]"
        accessibilityLabel={value ?? currentImageUrl ? changeLabel : actionLabel}
      >
        <View className="w-[56px] h-[56px] rounded-xl bg-primary-container items-center justify-center overflow-hidden">
          {value ? (
            <Image source={{ uri: value.uri }} className="w-full h-full" />
          ) : currentImageUrl ? (
            <Image source={{ uri: currentImageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <Camera size={24} color={tokens.colors.primary} strokeWidth={1.8} />
          )}
        </View>
        <View className="flex-1">
          <Text variant="bodyLarge" className="text-on-surface font-bold">
            {value ?? currentImageUrl ? changeLabel : actionLabel}
          </Text>
          <Text variant="bodyMedium" className="text-on-surface-variant">
            {permissionDenied ? permissionDeniedText : helperText}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
