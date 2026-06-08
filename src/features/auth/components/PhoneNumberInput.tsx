/**
 * PhoneNumberInput - country calling-code picker plus local number field.
 *
 * The backend accepts a single E.164-ish phoneNumber string, so this component
 * composes the displayed country code and local number into one value.
 */
import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import metadata from 'libphonenumber-js/min/metadata';
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js/core';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react-native';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { Text } from '../../../shared/components/Text';
import { TextInput } from '../../../shared/components/TextInput';
import { FieldError } from '../../../shared/components/FieldError';
import { tokens } from '../../../shared/theme';
import countries from '../../../shared/i18n/countries.json';

interface CountryOption {
  code: CountryCode;
  name: string;
  callingCode: string;
}

interface PhoneNumberInputProps {
  label?: string;
  value: string | undefined;
  onChange: (phoneNumber: string) => void;
  error?: string;
  placeholder?: string;
  editable?: boolean;
}

function getCallingCode(code: string) {
  try {
    return String(getCountryCallingCode(code as CountryCode, metadata));
  } catch {
    return null;
  }
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function buildPhoneNumber(country: CountryOption, localNumber: string) {
  const digits = digitsOnly(localNumber);
  return digits ? `+${country.callingCode}${digits}` : '';
}

function createOptions(): CountryOption[] {
  return (countries as { code: string; name: string }[])
    .map((country) => {
      const callingCode = getCallingCode(country.code);
      if (!callingCode) return null;
      return {
        code: country.code as CountryCode,
        name: country.name,
        callingCode,
      };
    })
    .filter((country): country is CountryOption => country !== null);
}

function getInitialState(value: string | undefined, options: CountryOption[]) {
  const fallbackCountry = options.find((country) => country.code === 'EG') ?? options[0];
  if (!value) return { country: fallbackCountry, localNumber: '' };

  const normalizedValue = value.startsWith('+') ? value : `+${value}`;
  const parsed = parsePhoneNumberFromString(normalizedValue, metadata);
  const parsedCountry = parsed?.country
    ? options.find((country) => country.code === parsed.country)
    : undefined;

  return {
    country: parsedCountry ?? fallbackCountry,
    localNumber: parsed?.nationalNumber ?? digitsOnly(value),
  };
}

export function PhoneNumberInput({
  label,
  value,
  onChange,
  error,
  placeholder,
  editable = true,
}: PhoneNumberInputProps) {
  const { t } = useTranslation();
  const options = useMemo(createOptions, []);
  const initialState = useMemo(() => getInitialState(value, options), [options, value]);
  const [selectedCountry, setSelectedCountry] = useState(initialState.country);
  const [localNumber, setLocalNumber] = useState(initialState.localNumber);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const searchRef = useRef<RNTextInput>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const lower = search.toLowerCase();
    return options.filter(
      (country) =>
        country.name.toLowerCase().includes(lower) ||
        country.code.toLowerCase().includes(lower) ||
        country.callingCode.includes(digitsOnly(search)),
    );
  }, [options, search]);

  const selectCountry = (country: CountryOption) => {
    setSelectedCountry(country);
    setVisible(false);
    setSearch('');
    onChange(buildPhoneNumber(country, localNumber));
  };

  const changeLocalNumber = (nextValue: string) => {
    const digits = digitsOnly(nextValue);
    setLocalNumber(digits);
    onChange(buildPhoneNumber(selectedCountry, digits));
  };

  return (
    <View className="gap-[4px]">
      {label && <LabelCaps>{label}</LabelCaps>}
      <View className="flex-row gap-[8px]">
        <Pressable
          onPress={() => editable && setVisible(true)}
          className={`min-h-[48px] rounded-sm px-[12px] flex-row items-center gap-[6px] ${
            error ? 'bg-primary-container/30 border border-primary' : 'bg-surface-container-high'
          }`}
          accessibilityLabel={label}
          disabled={!editable}
        >
          <Text variant="bodyLarge" className="text-on-surface font-bold">
            +{selectedCountry.callingCode}
          </Text>
          <ChevronDown size={16} color={tokens.colors.onSurfaceVariant} strokeWidth={1.8} />
        </Pressable>
        <View className="flex-1">
          <TextInput
            value={localNumber}
            onChangeText={changeLocalNumber}
            placeholder={placeholder}
            keyboardType="phone-pad"
            autoComplete="tel"
            editable={editable}
          />
        </View>
      </View>
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
                  onPress={() => selectCountry(item)}
                  className={`px-[16px] py-[14px] ${
                    item.code === selectedCountry.code ? 'bg-primary-container/30' : ''
                  }`}
                >
                  <Text variant="bodyLarge" className="text-on-surface">
                    {item.name}
                  </Text>
                  <Text variant="bodyMedium" className="text-on-surface-variant">
                    {item.code} +{item.callingCode}
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
