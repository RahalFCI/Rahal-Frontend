export const authEndpoints = {
  user: {
    register: '/User/register',
    login: '/User/login',
    googleSignIn: '/User/google-signin',
    logout: '/User/logout',
    get: (id: string) => `/User/${id}`,
    updatePassword: (id: string) => `/User/password/${id}`,
  },
  auth: {
    refresh: '/auth/generate',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  emailVerification: {
    verifyEmail: '/emailverification/verify-email',
    resendVerification: '/emailverification/resend-verification',
  },
  explorerProfile: {
    get: (id: string) => `/ExplorerProfile/${id}`,
    update: (id: string) => `/ExplorerProfile/${id}`,
    create: '/ExplorerProfile/create',
    updatePicture: (id: string) => `/ExplorerProfile/${id}/update-picture`,
  },
  userStats: {
    get: (explorerId: string) => `/UserStats/${explorerId}`,
  },
} as const;
