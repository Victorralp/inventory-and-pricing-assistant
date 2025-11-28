import { create } from 'zustand';

const usePropertyStore = create((set) => ({
  favorites: [],
  searchFilters: {
    location: '',
    priceMin: 0,
    priceMax: 100000000,
    propertyType: '',
    bedrooms: '',
  },
  addFavorite: (propertyId) =>
    set((state) => ({
      favorites: [...state.favorites, propertyId],
    })),
  removeFavorite: (propertyId) =>
    set((state) => ({
      favorites: state.favorites.filter((id) => id !== propertyId),
    })),
  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),
  clearFilters: () =>
    set({
      searchFilters: {
        location: '',
        priceMin: 0,
        priceMax: 100000000,
        propertyType: '',
        bedrooms: '',
      },
    }),
}));

export default usePropertyStore;
