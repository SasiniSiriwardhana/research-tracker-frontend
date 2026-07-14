import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthUser, UserRole } from '../interfaces';

// ============================================================
// JWT Payload shape coming from the Spring Boot backend.
// The backend embeds: sub (username), role (e.g. "ROLE_ADMIN")
// ============================================================
interface JwtPayload {
  sub: string;
  role: string;  // "ROLE_ADMIN" | "ROLE_PI" | "ROLE_MEMBER" | "ROLE_VIEWER"
  exp: number;
}

// ============================================================
// Context shape
// ============================================================
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userId: string, username: string, role: UserRole) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// Helper: parse stored auth data from localStorage
// ============================================================
const loadUserFromStorage = (): AuthUser | null => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) return null;

    // Verify token is not expired
    const decoded = jwtDecode<JwtPayload>(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
};

// ============================================================
// AuthProvider
// ============================================================
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadUserFromStorage();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (token: string, userId: string, username: string, role: UserRole) => {
      const authUser: AuthUser = { token, userId, username, role };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// useAuth hook
// ============================================================
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
