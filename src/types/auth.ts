
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  picture: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
