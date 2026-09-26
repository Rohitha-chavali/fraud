import React, { createContext, useContext, useState } from 'react';
import { Transaction } from '../types';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  activeTransaction: Transaction | null;
  setActiveTransaction: (txn: Transaction | null) => void;
  inspectedTxnId: string | null;
  setInspectedTxnId: (id: string | null) => void;
  activeTransactionModal: Transaction | null;
  setActiveTransactionModal: (txn: Transaction | null) => void;
  isLumoraOpen: boolean;
  setIsLumoraOpen: (open: boolean) => void;
  lumoraInitialPrompt: string | null;
  setLumoraInitialPrompt: (prompt: string | null) => void;
  openLumoraWithPrompt: (prompt: string, txn?: Transaction | null) => void;
  settings: {
    lumoraStyle: 'Concise' | 'Balanced' | 'Detailed';
    criticalAlertsEnabled: boolean;
    highRiskAlertsEnabled: boolean;
    autoRefresh: boolean;
  };
  updateSettings: (newSettings: Partial<AppContextType['settings']>) => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTransaction, setActiveTransaction] = useState<Transaction | null>(null);
  const [inspectedTxnId, setInspectedTxnId] = useState<string | null>('TXN-92831');
  const [activeTransactionModal, setActiveTransactionModal] = useState<Transaction | null>(null);
  const [isLumoraOpen, setIsLumoraOpen] = useState(false);
  const [lumoraInitialPrompt, setLumoraInitialPrompt] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [settings, setSettings] = useState<{
    lumoraStyle: 'Concise' | 'Balanced' | 'Detailed';
    criticalAlertsEnabled: boolean;
    highRiskAlertsEnabled: boolean;
    autoRefresh: boolean;
  }>({
    lumoraStyle: 'Balanced',
    criticalAlertsEnabled: true,
    highRiskAlertsEnabled: true,
    autoRefresh: true,
  });

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openLumoraWithPrompt = (prompt: string, txn?: Transaction | null) => {
    if (txn) {
      setActiveTransaction(txn);
      setInspectedTxnId(txn.transactionId);
    }
    setLumoraInitialPrompt(prompt);
    setIsLumoraOpen(true);
  };

  const updateSettings = (newSettings: Partial<AppContextType['settings']>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Preferences updated successfully', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        activeTransaction,
        setActiveTransaction,
        inspectedTxnId,
        setInspectedTxnId,
        activeTransactionModal,
        setActiveTransactionModal,
        isLumoraOpen,
        setIsLumoraOpen,
        lumoraInitialPrompt,
        setLumoraInitialPrompt,
        openLumoraWithPrompt,
        settings,
        updateSettings,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
