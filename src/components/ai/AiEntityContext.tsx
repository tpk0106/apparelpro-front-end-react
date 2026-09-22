import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import type { ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────

interface AiEntityContextValue {
  /** Current entity type (e.g. "Style", "PurchaseOrder", "Supplier") */
  entityType: string | undefined;
  /** Current entity key (e.g. "1/ORD001/2/ST001") */
  entityKey: string | undefined;
  /** Set the active entity context — call from any screen that has entity data */
  setAiEntity: (entityType: string, entityKey: string) => void;
  /** Clear the entity context — call when leaving an entity screen */
  clearAiEntity: () => void;
}

// ─── Context ────────────────────────────────────────────

const AiEntityContext = createContext<AiEntityContextValue>({
  entityType: undefined,
  entityKey: undefined,
  setAiEntity: () => {},
  clearAiEntity: () => {},
});

// ─── Provider ───────────────────────────────────────────

interface AiEntityProviderProps {
  children: ReactNode;
}

export function AiEntityProvider({ children }: AiEntityProviderProps) {
  const [entityType, setEntityType] = useState<string | undefined>(undefined);
  const [entityKey, setEntityKey] = useState<string | undefined>(undefined);

  const setAiEntity = useCallback((type: string, key: string) => {
    setEntityType(type);
    setEntityKey(key);
  }, []);

  const clearAiEntity = useCallback(() => {
    setEntityType(undefined);
    setEntityKey(undefined);
  }, []);

  const value = useMemo<AiEntityContextValue>(
    () => ({ entityType, entityKey, setAiEntity, clearAiEntity }),
    [entityType, entityKey, setAiEntity, clearAiEntity],
  );

  return (
    <AiEntityContext.Provider value={value}>
      {children}
    </AiEntityContext.Provider>
  );
}

// ─── Hooks ──────────────────────────────────────────────

/** Read the current AI entity context (used by AiChatFab / AiVoicePanel) */
export function useAiEntityContext(): AiEntityContextValue {
  return useContext(AiEntityContext);
}

/**
 * Convenience hook: sets the AI entity context while the calling component
 * is mounted and the entity values are defined.  Clears automatically on
 * unmount so the FAB falls back to general "Voice" mode.
 *
 * Usage in any entity screen:
 *   useSetAiEntity(
 *     scopeContext ? "Style" : undefined,
 *     scopeContext
 *       ? `${scopeContext.buyerCode}/${scopeContext.order}/${scopeContext.typeCode}/${scopeContext.styleCode}`
 *       : undefined,
 *   );
 */
export function useSetAiEntity(
  entityType: string | undefined,
  entityKey: string | undefined,
): void {
  const { setAiEntity, clearAiEntity } = useContext(AiEntityContext);

  useEffect(() => {
    if (entityType && entityKey) {
      setAiEntity(entityType, entityKey);
    } else {
      clearAiEntity();
    }

    return () => {
      clearAiEntity();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityKey]);
}
