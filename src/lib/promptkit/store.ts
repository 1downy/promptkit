import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppView = 'browse' | 'detail' | 'compare' | 'bookmarks';

export interface BookmarkItem {
  id: string;
  entryId: string;
  timestamp: number;
  type: 'full' | 'short';
}

export interface ModelViewSettings {
  showShortVersion?: boolean;
  useChinesePrompt?: boolean;
}

export type SortField = 'name' | 'provider' | 'quality' | 'date' | 'ranking';
export type SortOrder = 'asc' | 'desc';
export type SourceQualityFilter = 'all' | 'verified' | 'partial' | 'limited';

interface AppState {
  // Navigation
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedEntryId: string | null;
  setSelectedEntryId: (id: string | null) => void;

  // Filters
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  ecosystemFilter: string;
  setEcosystemFilter: (eco: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  providerFilter: string;
  setProviderFilter: (p: string) => void;
  sourceQualityFilter: SourceQualityFilter;
  setSourceQualityFilter: (q: SourceQualityFilter) => void;

  // Sorting
  sortBy: SortField;
  setSortBy: (f: SortField) => void;
  sortOrder: SortOrder;
  setSortOrder: (o: SortOrder) => void;

  // Compare
  compareIds: string[];
  addCompare: (id: string) => void;
  removeCompare: (id: string) => void;
  clearCompare: () => void;

  // Bookmarks
  bookmarks: BookmarkItem[];
  addBookmark: (entryId: string, type: 'full' | 'short') => void;
  removeBookmark: (entryId: string) => void;
  isBookmarked: (entryId: string) => boolean;

  // Search
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;

  // Display settings
  showShortVersion: boolean;
  setShowShortVersion: (v: boolean) => void;
  useChinesePrompt: boolean;
  setUseChinesePrompt: (v: boolean) => void;
  modelViewSettings: Record<string, ModelViewSettings>;
  getModelViewSetting: (entryId: string) => ModelViewSettings;
  setModelViewSetting: (entryId: string, setting: Partial<ModelViewSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeView: 'browse',
      setActiveView: (view) => set({ activeView: view }),
      selectedEntryId: null,
      setSelectedEntryId: (id) => set({ selectedEntryId: id, activeView: id ? 'detail' : 'browse' }),

      categoryFilter: 'all',
      setCategoryFilter: (cat) => set({ categoryFilter: cat }),
      ecosystemFilter: 'all',
      setEcosystemFilter: (eco) => set({ ecosystemFilter: eco }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      providerFilter: 'all',
      setProviderFilter: (p) => set({ providerFilter: p }),
      sourceQualityFilter: 'all',
      setSourceQualityFilter: (q) => set({ sourceQualityFilter: q }),

      sortBy: 'ranking',
      setSortBy: (f) => set({ sortBy: f }),
      sortOrder: 'desc',
      setSortOrder: (o) => set({ sortOrder: o }),

      compareIds: [],
      addCompare: (id) => set((s) => ({
        compareIds: s.compareIds.includes(id) ? s.compareIds : [...s.compareIds, id].slice(0, 4),
      })),
      removeCompare: (id) => set((s) => ({
        compareIds: s.compareIds.filter((c) => c !== id),
      })),
      clearCompare: () => set({ compareIds: [] }),

      bookmarks: [],
      addBookmark: (entryId, type) => set((s) => ({
        bookmarks: [...s.bookmarks.filter(b => b.entryId !== entryId), { id: crypto.randomUUID(), entryId, timestamp: Date.now(), type }],
      })),
      removeBookmark: (entryId) => set((s) => ({
        bookmarks: s.bookmarks.filter(b => b.entryId !== entryId),
      })),
      isBookmarked: (entryId) => get().bookmarks.some(b => b.entryId === entryId),

      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),

      showShortVersion: false,
      setShowShortVersion: (v) => set({ showShortVersion: v }),
      useChinesePrompt: true,
      setUseChinesePrompt: (v) => set({ useChinesePrompt: v }),
      modelViewSettings: {},
      getModelViewSetting: (entryId) => get().modelViewSettings[entryId] ?? {},
      setModelViewSetting: (entryId, setting) => set((s) => ({
        modelViewSettings: {
          ...s.modelViewSettings,
          [entryId]: { ...s.modelViewSettings[entryId], ...setting },
        },
      })),
    }),
    {
      name: 'promptkit-store',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        compareIds: state.compareIds,
        modelViewSettings: state.modelViewSettings,
      }),
    }
  )
);
