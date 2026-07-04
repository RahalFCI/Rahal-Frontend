import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VectorMap } from '../../src/shared/map/provider';
import type { MarkerData, Region } from '../../src/shared/map/provider';
import { useDiscoverPlaces } from '../../src/features/places/hooks/usePlaces';
import { useCategories } from '../../src/features/places/hooks/useCategories';
import { QuestCard } from '../../src/features/places/components/QuestCard';
import { NotificationBell } from '../../src/features/notifications/components/NotificationBell';
import { DiscoverSearchBar } from '../../src/features/places/components/DiscoverSearchBar';
import { CategoryFilterBar } from '../../src/features/places/components/CategoryFilterBar';
import { MOCK_VISITED_PLACE_IDS } from '../../src/features/places/fixtures/places.fixtures';
import { useCheckInHistory } from '../../src/features/gamification/hooks/useCheckInHistory';
import { useAuthStore } from '../../src/features/auth/store/authStore';
import { flags } from '../../src/config/flags';

/** Default framing until the user grants location / recenters. */
const DEFAULT_REGION: Region = {
  latitude: 30.0444,
  longitude: 31.2357,
  zoom: 11,
};

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { places, markers } = useDiscoverPlaces({ query, categoryId });
  const { data: categories } = useCategories();

  // Discovery state = the explorer's check-ins joined back to place ids. With
  // mock data on and no real history, a few seeded relics are pre-revealed so the
  // fog-of-war veil shows cleared windows out of the box.
  const explorerId = useAuthStore((s) => s.user?.id);
  const { data: checkInHistory } = useCheckInHistory(explorerId);
  const visitedIds = useMemo(() => {
    const ids = (checkInHistory?.items ?? [])
      .filter((item) => {
        const status = String(item.validationStatusName ?? item.validationStatus ?? '').toLowerCase();
        return status === 'verified' || status === '1';
      })
      .map((item) => item.placeId)
      .filter((id): id is string => !!id);
    if (ids.length === 0 && flags.mockData) return new Set(MOCK_VISITED_PLACE_IDS);
    return new Set(ids);
  }, [checkInHistory]);

  // Tag markers with discovery state so the map can both fog/reveal and style
  // discovered vs. undiscovered relic pins.
  const fogMarkers = useMemo<MarkerData[]>(
    () => markers.map((marker) => ({ ...marker, isVisited: visitedIds.has(marker.id) })),
    [markers, visitedIds],
  );

  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedId) ?? null,
    [places, selectedId],
  );

  return (
    <View className="flex-1 bg-surface">
      <VectorMap
        region={DEFAULT_REGION}
        markers={fogMarkers}
        selectedId={selectedId}
        onMarkerPress={setSelectedId}
        onPress={() => setSelectedId(null)}
      />

      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, gap: 12 }}
      >
        <View className="flex-row items-center gap-[10px]">
          <View className="flex-1">
            <DiscoverSearchBar
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                setSelectedId(null);
              }}
            />
          </View>
          <NotificationBell />
        </View>
        <CategoryFilterBar
          categories={categories ?? []}
          selectedId={categoryId}
          onSelect={(id) => {
            setCategoryId(id);
            setSelectedId(null);
          }}
        />
      </View>

      {selectedPlace ? (
        <QuestCard place={selectedPlace} onClose={() => setSelectedId(null)} />
      ) : null}
    </View>
  );
}
