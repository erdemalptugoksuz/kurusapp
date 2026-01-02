export interface UserProfile {
  id: string;
  email: string | null;
  fullName: string | null;
  timezone: string;
  defaultCurrencyCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  fullName?: string;
  timezone?: string;
  defaultCurrencyCode?: string;
}

