export const placesEndpoints = {
  places: {
    list: '/Place',
    detail: (id: string) => `/Place/${id}`,
    byCategory: (categoryId: string) => `/Place/category/${categoryId}`,
    searchNearby: '/Place/search',
  },
  categories: {
    list: '/PlaceCategory',
    detail: (id: string) => `/PlaceCategory/${id}`,
  },
  photos: {
    byPlace: (placeId: string) => `/PlacePhoto/place/${placeId}`,
    batch: '/PlacePhoto/batch',
  },
  search: {
    places: '/Search/places',
  },
} as const;
