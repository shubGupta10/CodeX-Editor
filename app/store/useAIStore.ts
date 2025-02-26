import { create } from "zustand";

interface CodeState {
  code: string;
  setCode: (code: string) => void;
}

export const useAIStore = create<CodeState>((set) => ({
  code: "",  
  setCode: (code) => set({ code }),
}));
