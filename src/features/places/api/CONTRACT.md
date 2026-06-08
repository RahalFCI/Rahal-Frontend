# Places API Contract

All endpoints are relative to `EXPO_PUBLIC_API_BASE_URL`, which already includes `/api`.

## Map Data

- `GET /Place?page={page}&pageSize={pageSize}` returns `ApiResponse<PagedResult<GetPlaceDto>>`.
- `GET /Place/{id}` returns `ApiResponse<GetPlaceDto>`.
- `GET /Place/category/{categoryId}?page={page}&pageSize={pageSize}` returns `ApiResponse<PagedResult<GetPlaceDto>>`.
- `POST /Place/search` currently binds from query parameters, not JSON body:
  - `Latitude`
  - `Longitude`
  - `RadiusInMeters`
  - `offsetPaginationRequest.Page`
  - `offsetPaginationRequest.PageSize`

The frontend intentionally sends nearby search parameters as query params until the backend contract is changed.

## Categories

- `GET /PlaceCategory` returns `ApiResponse<GetPlaceCategoryDto[]>`.

## Photos

- `GET /PlacePhoto/place/{placeId}` returns `ApiResponse<GetPlacePhotoDto[]>`.
- `GET /PlacePhoto/batch` exists in the backend but binds `[FromBody]` on a GET. It should not be used until replaced or supplemented by `POST /PlacePhoto/batch`.

## Search

- `GET /Search/places?query={query}&page={page}&pageSize={pageSize}` returns a non-standard search envelope:
  `{ success, data: { results, pagination } }`.
- This route must use a dedicated adapter and must not be passed through the standard `apiClient` envelope unwrapper.
