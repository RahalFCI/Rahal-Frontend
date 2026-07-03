/**
 * Category → glyph mapping for relic pins. Keyed loosely on the category name
 * (substring match) so it tolerates backend naming without coupling the map to
 * the places feature. Falls back to a compass for uncategorised relics.
 */
import {
  Building2,
  Church,
  Compass,
  Landmark,
  Mountain,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react-native';

const RULES: { match: RegExp; icon: LucideIcon }[] = [
  { match: /museum|gallery|librar|archive/i, icon: Building2 },
  { match: /monument|temple|tomb|pyramid|citadel|castle|histor/i, icon: Landmark },
  { match: /relig|mosque|church|worship|shrine/i, icon: Church },
  { match: /market|souk|bazaar|shop/i, icon: ShoppingBag },
  { match: /nature|oas|desert|mountain|beach|park|sea|nile/i, icon: Mountain },
];

export function iconForCategory(categoryName?: string): LucideIcon {
  if (!categoryName) return Compass;
  return RULES.find((rule) => rule.match.test(categoryName))?.icon ?? Compass;
}
