import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VectorMap } from '../../src/shared/map/provider';
import type { Region } from '../../src/shared/map/provider';
import { useDiscoverPlaces } from '../../src/features/places/hooks/usePlaces';
import { useCategories } from '../../src/features/places/hooks/useCategories';
import { QuestCard } from '../../src/features/places/components/QuestCard';
import { DiscoverSearchBar } from '../../src/features/places/components/DiscoverSearchBar';
import { CategoryFilterBar } from '../../src/features/places/components/CategoryFilterBar';

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

  const selectedPlace = useMemo(
    () => places.find((p) => p.id === selectedId) ?? null,
    [places, selectedId],
  );

  return (
    <View className="flex-1 bg-surface">
      <VectorMap
        region={DEFAULT_REGION}
        markers={markers}
        selectedId={selectedId}
        onMarkerPress={setSelectedId}
        onPress={() => setSelectedId(null)}
      />

      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, gap: 12 }}
      >
        <DiscoverSearchBar
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setSelectedId(null);
          }}
        />
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
