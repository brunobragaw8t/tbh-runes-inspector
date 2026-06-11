import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface SelectedRunesContextType {
  selectedRunesKeys: Set<number>;
  toggleSelected: (key: number) => void;
}

const SelectedRunesContext = createContext<SelectedRunesContextType | null>(null);

export function SelectedRunesProvider({ children }: { children: ReactNode }) {
  const [selectedRunesKeys, setSelectedRunesKeys] = useState<Set<number>>(new Set());

  function toggleSelected(key: number) {
    setSelectedRunesKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const value = useMemo(() => ({ selectedRunesKeys, toggleSelected }), [selectedRunesKeys]);

  return <SelectedRunesContext.Provider value={value}>{children}</SelectedRunesContext.Provider>;
}

export function useSelectedRunes() {
  const ctx = useContext(SelectedRunesContext);

  if (!ctx) throw new Error("useSelectedRunes must be used within SelectedRunesProvider");

  return ctx;
}
