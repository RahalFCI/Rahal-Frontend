/**
 * TravelPlanForm — collects the prompt, stay duration and budget for a plan. Kept as
 * string fields for clean RHF typing, then converted to the numeric CreateTravelPlanDto
 * on submit. One amber BeaconButton (§3.3). The screen owns premium/quota gating and
 * passes `disabled`.
 */
import { View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { TextInput } from '../../../shared/components';
import { BeaconButton } from '../../../shared/layout';
import type { CreateTravelPlanInput } from '../api/schemas';

const formSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  stayDurationDays: z
    .string()
    .refine((v) => Number.isInteger(Number(v)) && Number(v) > 0, { message: 'invalidDays' }),
  budgetLimit: z
    .string()
    .refine((v) => v.trim() !== '' && Number(v) >= 0, { message: 'invalidBudget' }),
});

type FormValues = z.infer<typeof formSchema>;

interface TravelPlanFormProps {
  onGenerate: (input: CreateTravelPlanInput) => void;
  pending?: boolean;
  disabled?: boolean;
  /** Label override for the generate button (e.g. quota-reached copy). */
  submitLabel?: string;
}

export function TravelPlanForm({
  onGenerate,
  pending = false,
  disabled = false,
  submitLabel,
}: TravelPlanFormProps) {
  const { t } = useTranslation('travel');
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: '', stayDurationDays: '3', budgetLimit: '' },
  });

  const submit = (values: FormValues) => {
    onGenerate({
      prompt: values.prompt.trim(),
      stayDurationDays: Number(values.stayDurationDays),
      budgetLimit: Number(values.budgetLimit),
    });
  };

  const blocked = disabled || pending;

  return (
    <View className="gap-[16px]">
      <Controller
        control={control}
        name="prompt"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('form.promptLabel')}
            placeholder={t('form.promptPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: 'top' }}
            error={errors.prompt ? t('form.promptError') : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="stayDurationDays"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('form.durationLabel')}
            placeholder={t('form.durationPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="number-pad"
            error={errors.stayDurationDays ? t('form.durationError') : undefined}
          />
        )}
      />

      <Controller
        control={control}
        name="budgetLimit"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label={t('form.budgetLabel')}
            placeholder={t('form.budgetPlaceholder')}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="numeric"
            error={errors.budgetLimit ? t('form.budgetError') : undefined}
          />
        )}
      />

      <BeaconButton
        label={submitLabel ?? (pending ? t('form.generating') : t('form.generate'))}
        onPress={handleSubmit(submit)}
        disabled={blocked}
        className={blocked ? 'opacity-50' : ''}
      />
    </View>
  );
}
