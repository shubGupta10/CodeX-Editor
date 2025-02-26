import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: {
    id: string;
    username?: string;
    email: string;
    profileImage?: string;
  } | null;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
    }
  )
);

export default useAuthStore;
