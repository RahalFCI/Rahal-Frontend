/**
 * i18n setup — i18next + react-i18next + expo-localization.
 * English is the only locale for v1; all strings go through t().
 * See claude.md §6.1.
 */
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import common from './en/common.json';
import auth from './en/auth.json';
import places from './en/places.json';
import gamification from './en/gamification.json';
import rewards from './en/rewards.json';
import social from './en/social.json';
import payment from './en/payment.json';

const i18n = createInstance();

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['common', 'auth', 'places', 'gamification', 'rewards', 'social', 'payment'],
  defaultNS: 'common',
  resources: {
    en: {
      common,
      auth,
      places,
      gamification,
      rewards,
      social,
      payment,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
