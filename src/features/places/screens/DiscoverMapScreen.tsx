import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Navigation, RotateCcw } from 'lucide-react-native';
import { VectorMap } from '../../../shared/map/provider';
import type { MarkerData, Region } from '../../../shared/map/types';
import { ErrorBanner } from '../../../shared/components/ErrorBanner';
import { LabelCaps } from '../../../shared/components/LabelCaps';
import { Text } from '../../../shared/components/Text';
import { tokens } from '../../../shared/theme';
import { useAuthStore } from '../../auth/store/authStore';
import { useProfile } from '../../auth/hooks/useProfile';
import {
  useNearbyPlaces,
  usePlaceCategories,
  usePlaceMarkers,
  usePlacePhotos,
} from '../hooks/usePlaces';
import type { Coordinates, PlaceMarker } from '../types';
import { CategoryFilterBar } from '../components/CategoryFilterBar';
import { DiscoverHeader } from '../components/DiscoverHeader';
import { DiscoverSearchBar } from '../components/DiscoverSearchBar';
import { RelicPeekCard } from '../components/RelicPeekCard';

const CAIRO_COORDS: Coordinates = {
  latitude: 30.0444,
  longitude: 31.2357,
};

const DEFAULT_REGION: Region = {
  ...CAIRO_COORDS,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debounced;
}

function markerFromPlace(place: PlaceMarker): MarkerData {
  return {
    id: place.id,
    latitude: place.latitude,
    longitude: place.longitude,
    title: place.title,
    description: place.description,
    categoryId: place.categoryId,
    categoryName: place.categoryName,
    updatedAt: place.updatedAt,
  };
}

export function DiscoverMapScreen() {
  const { t } = useTranslation('places');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const profile = useProfile(user?.id);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(CAIRO_COORDS);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const debouncedCenter = useDebouncedValue(mapCenter, 500);
  const queryCoords = hasLocationPermission ? debouncedCenter : null;
  const places = useNearbyPlaces(queryCoords);
  const categories = usePlaceCategories();
  const markers = usePlaceMarkers(places.data);
  const selectedPlace = markers.find((place) => place.id === selectedPlaceId) ?? null;
  const photos = usePlacePhotos(selectedPlace?.id);
  const visibleMarkers = useMemo(
    () =>
      markers
        .filter((place) => !selectedCategoryId || place.categoryId === selectedCategoryId)
        .map(markerFromPlace),
    [markers, selectedCategoryId],
  );
  const mapRegion = useMemo<Region>(
    () => ({
      latitude: mapCenter.latitude,
      longitude: mapCenter.longitude,
      latitudeDelta: DEFAULT_REGION.latitudeDelta,
      longitudeDelta: DEFAULT_REGION.longitudeDelta,
    }),
    [mapCenter.latitude, mapCenter.longitude],
  );

  useEffect(() => {
    let isMounted = true;

    async function resolveLocation() {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) return;

      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setHasLocationPermission(false);
        return;
      }

      setHasLocationPermission(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (!isMounted) return;
      const currentCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserCoords(currentCoords);
      setMapCenter(currentCoords);
    }

    resolveLocation().catch(() => {
      if (isMounted) setHasLocationPermission(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedPlaceId && !markers.some((marker) => marker.id === selectedPlaceId)) {
      setSelectedPlaceId(null);
    }
  }, [markers, selectedPlaceId]);

  const isLoading = places.isLoading || categories.isLoading || hasLocationPermission === null;
  const hasError = places.isError || categories.isError;

  return (
    <View className="flex-1 bg-surface">
      <VectorMap
        region={mapRegion}
        markers={visibleMarkers}
        selectedMarkerId={selectedPlaceId}
        onMarkerPress={(marker) => setSelectedPlaceId(marker.id)}
        onPress={() => setSelectedPlaceId(null)}
        onCameraSettled={(state) => {
          if (hasLocationPermission) {
            setMapCenter(state.center);
          }
        }}
      />

      <View className="absolute left-0 right-0" style={{ top: insets.top + 10 }}>
        <DiscoverHeader
          title={t('screen.discover.title')}
          profile={profile.data}
          fallbackName={user?.displayName}
          levelLabel={t('map.level', { level: profile.data?.level ?? 1 })}
        />
        <View className="mt-[10px]">
          <DiscoverSearchBar
            placeholder={t('map.searchPlaceholder')}
            accessibilityLabel={t('map.searchAction')}
          />
        </View>
        <View className="mt-[10px]">
          <CategoryFilterBar
            categories={categories.data ?? []}
            selectedId={selectedCategoryId}
            allLabel={t('map.allCategories')}
            onSelect={setSelectedCategoryId}
          />
        </View>
      </View>

      <View className="absolute left-0 right-0 px-[16px]" style={{ top: insets.top + 196 }}>
        {hasLocationPermission === false && (
          <View className="rounded-lg bg-surface-container-lowest/90 px-[12px] py-[8px]">
            <LabelCaps className="text-primary">{t('map.locationFallback')}</LabelCaps>
          </View>
        )}
        {hasError && (
          <View className="mt-[8px]">
            <ErrorBanner message={t('map.errorLoading')} />
          </View>
        )}
      </View>

      {isLoading && (
        <View className="absolute inset-0 items-center justify-center bg-surface/30">
          <View className="rounded-xl bg-surface-container-lowest/95 px-[18px] py-[14px] flex-row items-center gap-[10px]">
            <ActivityIndicator color={tokens.colors.primary} />
            <Text variant="bodyMedium" className="text-on-surface">
              {t('map.loadingPlaces')}
            </Text>
          </View>
        </View>
      )}

      {!isLoading && visibleMarkers.length === 0 && (
        <View className="absolute left-[16px] right-[16px] top-1/2 rounded-xl bg-surface-container-lowest/95 px-[16px] py-[14px]">
          <Text variant="bodyLarge" className="text-on-surface font-bold">
            {t('map.noPlacesNearby')}
          </Text>
          <Text variant="bodyMedium" className="text-on-surface-variant mt-[2px]">
            {t('map.noPlacesNearbyHint')}
          </Text>
        </View>
      )}

      <View className="absolute right-[16px]" style={{ bottom: insets.bottom + 104 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('map.recenter')}
          onPress={() => setMapCenter(hasLocationPermission ? (userCoords ?? CAIRO_COORDS) : CAIRO_COORDS)}
          className="h-[52px] w-[52px] rounded-xl bg-primary items-center justify-center"
          style={tokens.elevation.ambientShadow}
        >
          {hasLocationPermission ? (
            <Navigation size={22} color={tokens.colors.onPrimary} strokeWidth={2} />
          ) : (
            <RotateCcw size={22} color={tokens.colors.onPrimary} strokeWidth={2} />
          )}
        </Pressable>
      </View>

      {selectedPlace && (
        <View className="absolute left-0 right-0" style={{ bottom: insets.bottom + 92 }}>
          <RelicPeekCard
            place={selectedPlace}
            photos={photos.data}
            newDiscoveryLabel={t('map.newDiscovery')}
            xpLabel={t('map.xpReward')}
            openLabel={t('map.openPlace')}
            onOpen={() => router.push('/(explorer)')}
          />
        </View>
      )}
    </View>
  );
}
