import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { VectorMap } from '../../src/shared/map/provider';
import type { Region } from '../../src/shared/map/provider';
import { usePlaces } from '../../src/features/places/hooks/usePlaces';
import { QuestCard } from '../../src/features/places/components/QuestCard';

/** Default framing until the user grants location / recenters. */
const DEFAULT_REGION: Region = {
  latitude: 30.0444,
  longitude: 31.2357,
  zoom: 11,
};

export default function DiscoverScreen() {
  const { places, markers } = usePlaces();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      {selectedPlace ? (
        <QuestCard place={selectedPlace} onClose={() => setSelectedId(null)} />
      ) : null}
    </View>
  );
}
