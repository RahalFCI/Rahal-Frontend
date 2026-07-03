/**
 * Relic pins — the editorial marker views placed on the map as MapLibre
 * `Marker` annotations (arbitrary React views, vs. flat vector circles).
 *
 * Three states express the fog-of-war narrative (CLAUDE.md §3.2 — discovery as a
 * journal entry, not an arcade pickup):
 *  - discovered  → amber "beacon" medallion, white ring, dropped pointer
 *  - undiscovered→ pale parchment ghost, dashed outline, muted glyph
 *  - selected    → the discovered/ghost medallion enlarged inside an amber halo
 *
 * Clusters (dense areas at low zoom) render as a count bubble instead.
 */
import { StyleSheet, View } from 'react-native';
import { Marker } from '@maplibre/maplibre-react-native';
import { Icon, Text } from '../components';
import { useTheme } from '../theme';
import { iconForCategory } from './markerIcons';
import type { MapCluster } from './clustering';
import type { MarkerData } from './types';

interface RelicMarkerProps {
  marker: MarkerData;
  selected: boolean;
  onPress: (id: string) => void;
}

export function RelicMarker({ marker, selected, onPress }: RelicMarkerProps) {
  const theme = useTheme();
  const visited = !!marker.isVisited;
  const glyph = iconForCategory(marker.categoryName);

  const medallionColor = visited ? theme.colors.primary : theme.colors.surfaceContainerLowest;
  const ringColor = visited ? theme.colors.surfaceContainerLowest : theme.colors.outlineVariant;
  const glyphColor = visited ? theme.colors.onPrimary : theme.colors.onSurfaceVariant;
  const size = selected ? 46 : visited ? 40 : 34;

  return (
    <Marker
      id={marker.id}
      lngLat={[marker.longitude, marker.latitude]}
      anchor="bottom"
      onPress={() => onPress(marker.id)}
    >
      <View style={styles.pinColumn}>
        {selected ? (
          <View
            style={[
              styles.halo,
              {
                width: size + 18,
                height: size + 18,
                borderRadius: (size + 18) / 2,
                backgroundColor: theme.colors.primaryContainer,
                borderColor: theme.colors.primary,
              },
            ]}
          />
        ) : null}
        <View
          style={[
            styles.medallion,
            visited || selected ? theme.elevation.ambientShadow : null,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: medallionColor,
              borderColor: ringColor,
              borderStyle: visited ? 'solid' : 'dashed',
              opacity: visited || selected ? 1 : 0.92,
            },
          ]}
        >
          <Icon icon={glyph} size={selected ? 22 : 19} color={glyphColor} strokeWidth={2} />
        </View>
        <View
          style={[
            styles.pointer,
            { borderTopColor: visited || selected ? theme.colors.primary : theme.colors.outlineVariant },
          ]}
        />
      </View>
    </Marker>
  );
}

interface ClusterMarkerProps {
  cluster: Extract<MapCluster, { kind: 'cluster' }>;
  onPress: (cluster: Extract<MapCluster, { kind: 'cluster' }>) => void;
}

export function ClusterMarker({ cluster, onPress }: ClusterMarkerProps) {
  const theme = useTheme();
  const bubbleColor = cluster.allVisited ? theme.colors.primary : theme.colors.primaryContainer;
  const textColor = cluster.allVisited ? theme.colors.onPrimary : theme.colors.primary;

  return (
    <Marker
      id={cluster.id}
      lngLat={[cluster.longitude, cluster.latitude]}
      anchor="center"
      onPress={() => onPress(cluster)}
    >
      <View
        style={[
          styles.cluster,
          theme.elevation.ambientShadow,
          { backgroundColor: bubbleColor, borderColor: theme.colors.primary },
        ]}
      >
        <Text variant="labelMedium" className="font-bold" style={{ color: textColor }}>
          {cluster.count}
        </Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pinColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  halo: {
    position: 'absolute',
    top: -9,
    borderWidth: 1.5,
    opacity: 0.5,
  },
  medallion: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
  },
  pointer: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  cluster: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
