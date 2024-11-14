import { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { HttpService } from '../services/http-service';

interface UserContextType {
  userId: number | null;
  setUserId: (id: number | null) => void;
  fetchUserId: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<number | null>(null);

  const fetchUserId = useCallback(async () => {
    try {
      console.log("[UserContext] Fethching user auth/me...")
      const response = await HttpService.get<{ id: number }>('/auth/me/');
      console.log("[UserContext] Response: ", response);
      setUserId(response.id);
    } catch (error) {
      setUserId(null);
    }
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId, fetchUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
