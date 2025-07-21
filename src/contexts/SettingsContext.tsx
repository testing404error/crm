import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Settings {
  companyName: string;
}

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
    companyName: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('company_name')
        .single();

      if (data) {
        setSettings({ companyName: data.company_name });
      }
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));

    const { data } = await supabase
      .from('system_settings')
      .select('id')
      .single();

    if (data) {
      await supabase
        .from('system_settings')
        .update({ company_name: newSettings.companyName })
        .eq('id', 1);
    } else {
      await supabase
        .from('system_settings')
        .insert([{ id: 1, company_name: newSettings.companyName }]);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
