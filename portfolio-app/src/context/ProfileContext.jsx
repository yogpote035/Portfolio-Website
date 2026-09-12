import { createContext, useContext } from 'react';
import { profile } from '../data/profile.js';
import { stats } from '../data/resume.js';
import { useApiData } from '../hooks/useApiData.js';
import { normalizeProfile } from '../utils/apiTransform.js';

const ProfileContext = createContext({ profileData: { ...profile, stats }, loading: true });

export function ProfileProvider({ children }) {
  const { data, loading, error } = useApiData({
    path: '/api/profile',
    fallbackData: { ...profile, stats },
    transform: (value) => normalizeProfile(value, profile, stats),
  });
  return <ProfileContext.Provider value={{ profileData: data, loading, error }}>{children}</ProfileContext.Provider>;
}

export const useProfile = () => useContext(ProfileContext);
