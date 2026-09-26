import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SmellMemory, Season, SmellType, Emotion } from '../utils/constants';
import { SEASONS } from '../utils/constants';
import { generateId } from '../utils/helpers';
import { mockMemories } from '../data/mockData';

export interface MemoryInput {
  location: string;
  source_guess: string;
  intensity: number;
  humidity: number;
  seasons: Season[];
  smell_type: SmellType;
  memory_text: string;
  color_association: string;
  emotion: Emotion;
  want_again: boolean;
}

const VALID_SEASONS = SEASONS.map((s) => s.value);

/** 旧数据只有单个 season 字段，打开页面时迁移为 seasons 标签数组 */
function migrateMemory(raw: unknown): SmellMemory {
  const rec = raw as Record<string, unknown> & { season?: Season; seasons?: Season[] };
  const source = Array.isArray(rec.seasons) && rec.seasons.length > 0
    ? rec.seasons
    : rec.season
      ? [rec.season]
      : [];
  const seasons = [...new Set(source)].filter((s): s is Season =>
    VALID_SEASONS.includes(s as Season),
  );
  const { season: _legacy, ...rest } = rec;
  void _legacy;
  return { ...rest, seasons } as unknown as SmellMemory;
}

interface MemoryStore {
  memories: SmellMemory[];
  addMemory: (input: MemoryInput) => void;
  updateMemory: (id: string, input: MemoryInput) => void;
  deleteMemory: (id: string) => void;
  initIfEmpty: () => void;
}

export const useMemoryStore = create<MemoryStore>()(
  persist(
    (set, get) => ({
      memories: [],
      addMemory: (input) => {
        const now = new Date().toISOString();
        const newMem: SmellMemory = {
          id: generateId(),
          ...input,
          created_at: now,
          updated_at: now,
        };
        set({ memories: [newMem, ...get().memories] });
      },
      updateMemory: (id, input) => {
        set({
          memories: get().memories.map((m) =>
            m.id === id
              ? { ...m, ...input, updated_at: new Date().toISOString() }
              : m,
          ),
        });
      },
      deleteMemory: (id) => {
        set({ memories: get().memories.filter((m) => m.id !== id) });
      },
      initIfEmpty: () => {
        if (get().memories.length === 0) {
          set({ memories: mockMemories });
        }
      },
    }),
    {
      name: 'scent-memory-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => {
        const state = persisted as { memories?: unknown[] };
        if (state && Array.isArray(state.memories)) {
          return { ...state, memories: state.memories.map(migrateMemory) };
        }
        return state;
      },
    },
  ),
);
