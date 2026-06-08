# Auth API Contract — Phase 1

> Re-checked against `E:\projects\Rahal-Backend` on 2026-06-04.
> This document describes the backend contract the frontend currently targets.

## Base URL

- Docker Compose development: `http://localhost:7145/api`
- App env: `EXPO_PUBLIC_API_BASE_URL=http://localhost:7145/api`

## Response Envelope

Most successful responses are wrapped as:

```ts
interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  errorCode: string;
}
```

Exceptions:

- `POST /api/User/logout` returns `204 No Content`.
- `POST /api/auth/forgot-password` returns `204 No Content`.
- FluentValidation failures return `{ errors: Array<{ property: string; message: string }> }`.
- Unhandled backend exceptions can return `{ message: string; type: string }`.

## Implemented Frontend Endpoints

### POST `/api/User/register`

Auth: anonymous

Request:

```ts
interface BaseRegisterDto {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  userRole: 'Explorer';
}
```

Response: `200 ApiResponse<string>`

Notes:

- Backend currently annotates `201` in OpenAPI but returns `Ok(result)`, so runtime status is `200`.
- This endpoint creates the user account only. Explorer profile data is no longer accepted here.

### POST `/api/User/login`

Auth: anonymous

Request:

```ts
interface AuthRequestDto {
  email: string;
  password: string;
}
```

Response: `200 ApiResponse<AuthResponseDto>`

Important behavior:

- Login fails until the email OTP is confirmed.
- A logged-in Explorer without an Explorer profile can receive `ProfileSetupRequired`.

### POST `/api/User/google-signin`

Auth: anonymous

Request:

```ts
interface GoogleSignInRequest {
  idToken: string;
}
```

Response: `200 ApiResponse<AuthResponseDto>`

### POST `/api/emailverification/verify-email`

Auth: anonymous

Request:

```ts
interface VerifyOtpRequest {
  email: string;
  otp: string;
}
```

Response: `200 ApiResponse<string>`

### POST `/api/emailverification/resend-verification`

Auth: anonymous, rate-limited to 3 attempts per 5 minutes by IP.

Request:

```ts
interface ResendOtpRequest {
  email: string;
}
```

Response: `200 ApiResponse<string>`

### POST `/api/auth/forgot-password`

Auth: anonymous

Request:

```ts
interface ForgotPasswordRequest {
  email: string;
}
```

Response: `204 No Content`

### POST `/api/auth/reset-password`

Auth: anonymous

Request:

```ts
interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}
```

Response: `200 ApiResponse<string>`

### POST `/api/User/logout`

Auth: bearer token required

Response: `204 No Content`

### GET `/api/User/{id}`

Auth: bearer token required

Response: `200 ApiResponse<BaseUserDto>`

```ts
interface BaseUserDto {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: number;
}
```

Notes:

- Explorer profile DTOs do not include account email or phone number. The frontend fetches this endpoint alongside `/ExplorerProfile/{explorerId}` so edit-profile fields can be pre-populated.

### POST `/api/auth/generate`

Auth: anonymous

Request:

```ts
interface TokenDto {
  accessToken: string;
  refreshToken: string;
}
```

Response: `200 ApiResponse<AuthResponseDto>`

### GET `/api/ExplorerProfile/{explorerId}`

Auth: bearer token required

Response: `200 ApiResponse<GetExplorerDto>`

```ts
interface GetExplorerDto {
  userId: string;
  displayName: string;
  profilePictureUrl: string;
  birthDate: string;
  gender: number;
  bio: string;
  countryCode: string;
  level: number;
  isPublic: boolean;
  isPremium: boolean;
}
```

### POST `/api/ExplorerProfile/create`

Auth: bearer token required

Content type: `multipart/form-data`

Form fields:

```ts
interface AddExplorerDto {
  DisplayName: string;
  UserId: string;
  BirthDate: string;
  Gender: number;
  Bio: string;
  CountryCode: string;
  IsPublic: boolean;
  IsPremium: boolean;
  profilePicture?: File;
}
```

Response: `200 ApiResponse<GetExplorerDto>`

Notes:

- This endpoint is marked with `SkipProfileCheckAttribute`, so it is the frontend recovery path when another authenticated endpoint returns `ProfileSetupRequired`.
- `profilePicture` is optional. The backend upload command currently reports `InvalidRequest` when omitted, but the profile creation orchestrator continues and creates the profile without a picture.

### GET `/api/UserStats/{explorerId}`

Auth: bearer token required

Response: `200 ApiResponse<GetUserStatsDto>`

The frontend combines this with `GetExplorerDto` so existing screens can keep displaying XP and streak values.

### PUT `/api/ExplorerProfile/{explorerId}`

Auth: Explorer bearer token required

Content type: `multipart/form-data`

Form fields:

```ts
interface UpdateExplorerDto {
  UserId: string;
  DisplayName: string;
  ProfilePictureUrl: string;
  BirthDate: string;
  Gender: number;
  Bio: string;
  CountryCode: string;
  AvailableXp: number;
  CumlativeXp: number;
  Level: number;
  IsPublic: boolean;
  IsPremium: boolean;
}
```

Response: `200 ApiResponse<GetExplorerDto>`

### PUT `/api/ExplorerProfile/{explorerId}/update-picture`

Auth: Explorer bearer token required

Content type: `multipart/form-data`

Form fields:

```ts
interface UpdateExplorerProfilePictureForm {
  profilePicture: File;
}
```

Response: `200 ApiResponse<string>` containing the uploaded profile picture URL.

### PUT `/api/User/password/{id}`

Auth: bearer token required

Request:

```ts
interface UpdatePasswordDto {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
```

Response: `200 ApiResponse<string>`

## Shared DTOs

```ts
interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: string;
  refreshTokenExpiration: string;
}
```

## Error Code Mapping

| Backend Code | Name                 | Frontend Code          | Tier   |
| -----------: | -------------------- | ---------------------- | ------ |
|        40100 | Unauthorized         | UNAUTHORIZED           | silent |
|        40300 | Forbidden            | FORBIDDEN              | toast  |
|        40301 | LockedOut            | LOCKED_OUT             | screen |
|        40302 | EmailNotVerified     | EMAIL_NOT_VERIFIED     | screen |
|        40303 | ProfileSetupRequired | PROFILE_SETUP_REQUIRED | screen |
|        40400 | NotFound             | NOT_FOUND              | toast  |
|        40900 | Conflict             | UNKNOWN                | toast  |
|        40901 | AlreadyExists        | ALREADY_EXISTS         | screen |
|        42200 | ValidationError      | VALIDATION_FAILED      | toast  |
|        42201 | InvalidFormat        | VALIDATION_FAILED      | toast  |
|        42202 | InvalidValue         | VALIDATION_FAILED      | toast  |
|        42203 | InvalidCredentials   | INVALID_CREDENTIALS    | screen |
|        50000 | UnknownError         | SERVER                 | screen |
|        50010 | DatabaseError        | SERVER                 | screen |
|        50200 | ExternalServiceError | SERVER                 | toast  |
|        50400 | Timeout              | SERVER                 | toast  |

## Backend Notes To Fix

- `UpdateExplorerProfileCommandHandler` currently returns `AlreadyExists` when an existing profile is found, which makes normal profile updates fail.
- `UpdateExplorerDto` requires XP fields even though `GetExplorerDto` does not return XP; the frontend fetches `/UserStats/{explorerId}` to preserve those values.
- `TokenDtoValidator` previously validated `AccessToken` twice; re-check before relying on strict refresh-token validation.
- `TokenService.RefreshExpiredToken()` should rotate refresh tokens if the security model requires rotation.
