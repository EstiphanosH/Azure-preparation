import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FeatureFlagDefinition } from '../../engine/types.ts';

const INITIAL_FLAGS: Record<string, boolean> = {
  ff_progressive_hint_ladder: true,
  ff_export_audit_log: true,
  ff_interactive_node_drag: false,
  ff_strict_timer_enforcement: true,
  ff_reference_patch_shortcut: true,
  ff_edge_packet_animation: true,
};

interface FlagContextType {
  flags: Record<string, boolean>;
  isEnabled: (flagName: string) => boolean;
  setFlag: (flagName: string, enabled: boolean) => void;
  toggleFlag: (flagName: string) => void;
}

const FlagContext = createContext<FlagContextType | undefined>(undefined);

export const FlagProvider: React.FC<{ children: ReactNode; initialOverrides?: Record<string, boolean> }> = ({
  children,
  initialOverrides = {},
}) => {
  const [flags, setFlags] = useState<Record<string, boolean>>({
    ...INITIAL_FLAGS,
    ...initialOverrides,
  });

  const isEnabled = (flagName: string): boolean => {
    return flags[flagName] ?? false;
  };

  const setFlag = (flagName: string, enabled: boolean) => {
    setFlags((prev) => ({ ...prev, [flagName]: enabled }));
  };

  const toggleFlag = (flagName: string) => {
    setFlags((prev) => ({ ...prev, [flagName]: !prev[flagName] }));
  };

  return (
    <FlagContext.Provider value={{ flags, isEnabled, setFlag, toggleFlag }}>
      {children}
    </FlagContext.Provider>
  );
};

export function useFlag(flagName: string): boolean {
  const ctx = useContext(FlagContext);
  if (!ctx) {
    return INITIAL_FLAGS[flagName] ?? false;
  }
  return ctx.isEnabled(flagName);
}

export function useFeatureFlags(): FlagContextType {
  const ctx = useContext(FlagContext);
  if (!ctx) {
    return {
      flags: INITIAL_FLAGS,
      isEnabled: (name) => INITIAL_FLAGS[name] ?? false,
      setFlag: () => {},
      toggleFlag: () => {},
    };
  }
  return ctx;
}

interface FeatureGateProps {
  flag: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ flag, children, fallback = null }) => {
  const enabled = useFlag(flag);
  if (!enabled) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
};
