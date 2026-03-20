import React, { createContext, useContext, useState, useEffect } from 'react';
import { shopApi } from '@/services/api';
import type { ShopSettings } from '@/types';

interface ShopContextType {
  settings: ShopSettings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await shopApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch shop settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ShopContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
