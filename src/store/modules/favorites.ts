import { defineStore } from 'pinia'

// 定义收藏项接口
export interface FavoriteItem {
  id: number;
  title: string;
  abstract: string;
  content: string;
  category: string;
  author: string;
  source: 'personal' | 'team' | 'community';
  sourceUrl: string;
  tags: string[];
  favoriteTime: string;
}

interface FavoritesState {
  favorites: FavoriteItem[];
}

export const useFavoritesStore = defineStore('favorites', {
  state: (): FavoritesState => ({
    favorites: [] as FavoriteItem[]
  }),
  
  getters: {
    // 所有收藏
    allFavorites: (state: FavoritesState) => state.favorites,
    
    // 按来源筛选的收藏
    favoritesBySource: (state: FavoritesState) => (source: string) => {
      if (source === 'all') return state.favorites
      return state.favorites.filter((item: FavoriteItem) => item.source === source)
    },
    
    // 按类别筛选的收藏
    favoritesByCategory: (state: FavoritesState) => (category: string) => {
      if (!category) return state.favorites
      return state.favorites.filter((item: FavoriteItem) => item.category === category)
    },
    
    // 获取总数
    totalCount: (state: FavoritesState) => state.favorites.length
  },
  
  actions: {
    // 添加收藏
    addFavorite(item: FavoriteItem) {
      // 检查是否已存在
      const existingIndex = this.favorites.findIndex(
        (f: FavoriteItem) => f.id === item.id && f.source === item.source
      )
      
      if (existingIndex === -1) {
        this.favorites.push(item)
        return true
      }
      return false
    },
    
    // 移除收藏
    removeFavorite(id: number, source: string) {
      const index = this.favorites.findIndex(
        (f: FavoriteItem) => f.id === id && f.source === source
      )
      
      if (index !== -1) {
        this.favorites.splice(index, 1)
        return true
      }
      return false
    },
    
    // 检查是否已收藏
    isFavorite(id: number, source: string): boolean {
      return this.favorites.some((f: FavoriteItem) => f.id === id && f.source === source)
    }
  },
  
  persist: {
    key: 'knowledge-base-favorites',
    storage: window.localStorage
  }
}) 