/**
 * CountryPicker — Modal with searchable list of ISO 3166-1 countries.
 * Renders as a pressable field that opens a full-screen modal with FlatList.
 */
import { useState, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  Modal,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../shared/components/Text';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { FieldError } from '../../../shared/components/FieldError';
import { TextInput } from '../../../shared/components/TextInput';
import countries from '../../../shared/i18n/countries.json';

interface Country {
  code: string;
  name: string;
}

interface CountryPickerProps {
  label?: string;
  value: string | undefined;
  onChange: (code: string) => void;
  error?: string;
  placeholder?: string;
}

export function CountryPicker({ label, value, onChange, error, placeholder }: CountryPickerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<RNTextInput>(null);

  const selectedCountry = useMemo(
    () => (countries as Country[]).find((c) => c.code === value),
    [value],
  );

  const filtered = useMemo(() => {
    if (!search) return countries as Country[];
    const lower = search.toLowerCase();
    return (countries as Country[]).filter(
      (c) => c.name.toLowerCase().includes(lower) || c.code.toLowerCase().includes(lower),
    );
  }, [search]);

  return (
    <View className="gap-[4px]">
      {label && <LabelCaps>{label}</LabelCaps>}
      <Pressable
        onPress={() => setVisible(true)}
        className={`rounded-sm px-[16px] py-[12px] min-h-[48px] justify-center ${
          error ? 'bg-primary-container/30 border border-primary' : 'bg-surface-container-high'
        }`}
        accessibilityLabel={label}
      >
        <Text
          variant="bodyLarge"
          className={selectedCountry ? 'text-on-surface' : 'text-on-surface-variant'}
        >
          {selectedCountry
            ? `${selectedCountry.name} (${selectedCountry.code})`
            : (placeholder ?? '')}
        </Text>
      </Pressable>

      {error && <FieldError message={error} />}

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onShow={() => searchRef.current?.focus()}
      >
        <SafeAreaView className="flex-1 bg-surface">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <View className="px-[16px] pt-[16px] pb-[8px] flex-row items-center justify-between">
              <Text variant="headlineSmall">{t('picker.countryTitle')}</Text>
              <Pressable onPress={() => setVisible(false)} hitSlop={8}>
                <Text variant="bodyLarge" className="text-primary font-bold">
                  {t('action.close')}
                </Text>
              </Pressable>
            </View>

            <View className="px-[16px] pb-[8px]">
              <TextInput
                ref={searchRef}
                placeholder={t('picker.countrySearch')}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onChange(item.code);
                    setVisible(false);
                    setSearch('');
                  }}
                  className={`px-[16px] py-[14px] ${
                    item.code === value ? 'bg-primary-container/30' : ''
                  }`}
                >
                  <Text variant="bodyLarge" className="text-on-surface">
                    {item.name}
                  </Text>
                  <Text variant="bodyMedium" className="text-on-surface-variant">
                    {item.code}
                  </Text>
                </Pressable>
              )}
              keyboardShouldPersistTaps="handled"
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
