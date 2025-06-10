
import { Product, AdStatus, SAMPLE_USER_ID_1, SAMPLE_USER_ID_2, SAMPLE_USER_ID_3, ProductCondition } from '../types';
import { CATEGORIES, DEFAULT_PLACEHOLDER_IMAGE } from '../constants';
import { UKRAINIAN_CITIES } from '../cities'; // Import cities

const LISTINGS_STORAGE_KEY = 'scrBaraholkaListings';

const loadListingsFromStorage = (): Product[] => {
  try {
    const storedListings = localStorage.getItem(LISTINGS_STORAGE_KEY);
    if (storedListings) {
      const parsedListings = JSON.parse(storedListings) as Product[];
      // Basic data migration: if old listings don't have city/condition, add defaults
      return Array.isArray(parsedListings) ? parsedListings.map(p => ({
          ...p,
          city: p.city || UKRAINIAN_CITIES[0], // Default to first city if missing
          condition: p.condition || ProductCondition.USED, // Default to used if missing
      })) : generateSampleListings();
    }
  } catch (error) {
    console.error("Error reading listings from localStorage:", error);
  }
  const sample = generateSampleListings();
  localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(sample));
  return sample;
};

const generateSampleListings = (): Product[] => {
  return [
    {
      id: '1',
      title: 'Крутые кроссовки Nike Air',
      description: 'Почти новые, носил пару раз. Размер 42. Оригинал.',
      price: 2500,
      category: 'clothing',
      subcategory: 'sneakers',
      images: [`${DEFAULT_PLACEHOLDER_IMAGE}1`, `${DEFAULT_PLACEHOLDER_IMAGE}2`],
      userId: SAMPLE_USER_ID_2, 
      status: AdStatus.ACTIVE,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, 
      contactInfo: '@nike_seller_example',
      city: UKRAINIAN_CITIES[Math.floor(Math.random() * 10)], // Random city from first 10
      condition: ProductCondition.USED,
    },
    {
      id: '2',
      title: 'iPhone 13 Pro Max (Новый)',
      description: 'Состояние идеальное, полный комплект. Память 256GB. Запечатан.',
      price: 35000,
      category: 'electronics',
      subcategory: 'phones',
      images: [`${DEFAULT_PLACEHOLDER_IMAGE}3`],
      userId: SAMPLE_USER_ID_3, 
      status: AdStatus.ACTIVE,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, 
      contactInfo: '@apple_fan_example',
      city: UKRAINIAN_CITIES[Math.floor(Math.random() * 10) + 5], // Random city
      condition: ProductCondition.NEW,
    },
    {
      id: '3',
      title: 'Аккаунт Steam с CS2 Prime (Пример Б/У)',
      description: 'Много игр, высокий уровень. Подробности в ЛС. (Это объявление от Sample User 1)',
      price: 1200,
      category: 'digital-goods',
      subcategory: 'game-accounts',
      images: [],
      userId: SAMPLE_USER_ID_1, 
      status: AdStatus.PENDING,
      createdAt: Date.now() - 1000 * 60 * 60 * 3, 
      contactInfo: '@my_steam_acc_example',
      city: UKRAINIAN_CITIES[0], // Kyiv
      condition: ProductCondition.USED,
    },
     {
      id: '4',
      title: 'Жидкость для вейпа "Лесные ягоды" (Новая)',
      description: 'Очень вкусная, никотин 3мг. Новая, запечатанная.',
      price: 300,
      category: 'vapes',
      subcategory: 'vape-liquids',
      images: [`${DEFAULT_PLACEHOLDER_IMAGE}4`],
      userId: SAMPLE_USER_ID_3, 
      status: AdStatus.ACTIVE,
      createdAt: Date.now() - 1000 * 60 * 60 * 24, 
      contactInfo: '@vape_guru_example',
      city: UKRAINIAN_CITIES[3], // Dnipro
      condition: ProductCondition.NEW,
    },
    {
      id: '5',
      title: 'Толстовка (худи) серая унисекс (Пример Б/У)',
      description: 'Размер L, очень теплая и удобная. Состояние отличное. (Это объявление от Sample User 1)',
      price: 800,
      category: 'clothing',
      subcategory: 'hoodies',
      images: [`${DEFAULT_PLACEHOLDER_IMAGE}5`, `${DEFAULT_PLACEHOLDER_IMAGE}6`],
      userId: SAMPLE_USER_ID_1, 
      status: AdStatus.REJECTED,
      rejectionReason: 'Фотография не соответствует товару. Пожалуйста, загрузите актуальное фото.',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, 
      contactInfo: '@fashion_lover_example',
      city: UKRAINIAN_CITIES[6], // Lviv
      condition: ProductCondition.USED,
    }
  ];
}


const saveListingsToStorage = (listingsToSave: Product[]) => {
  try {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listingsToSave));
  } catch (error) {
    console.error("Error saving listings to localStorage:", error);
  }
};

export const listingService = {
  getAllListings: async (): Promise<Product[]> => {
    const listings = loadListingsFromStorage();
    return [...listings].sort((a,b) => b.createdAt - a.createdAt);
  },

  getActiveListings: async (): Promise<Product[]> => {
    const listings = loadListingsFromStorage();
    return listings.filter(p => p.status === AdStatus.ACTIVE).sort((a,b) => b.createdAt - a.createdAt);
  },

  getListingById: async (id: string): Promise<Product | undefined> => {
    const listings = loadListingsFromStorage();
    return listings.find(p => p.id === id);
  },

  getListingsByUserId: async (userId: string): Promise<Product[]> => {
    const listings = loadListingsFromStorage();
    return listings.filter(p => p.userId === userId).sort((a,b) => b.createdAt - a.createdAt);
  },
  
  createListing: async (productData: Omit<Product, 'id' | 'createdAt' | 'status'>): Promise<Product> => {
    let listings = loadListingsFromStorage();
    const newProduct: Product = {
      ...productData, 
      id: String(Date.now() + Math.random()), 
      createdAt: Date.now(),
      status: AdStatus.PENDING, 
    };
    listings.unshift(newProduct);
    saveListingsToStorage(listings);
    return newProduct;
  },

  updateListing: async (id: string, updates: Partial<Product>): Promise<Product | undefined> => {
    let listings = loadListingsFromStorage();
    const index = listings.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    listings[index] = { ...listings[index], ...updates };
    saveListingsToStorage(listings);
    return listings[index];
  },

  deleteListing: async (id: string): Promise<boolean> => {
    let listings = loadListingsFromStorage();
    const initialLength = listings.length;
    listings = listings.filter(p => p.id !== id);
    saveListingsToStorage(listings);
    return listings.length < initialLength;
  },

  // Admin functions
  getPendingListings: async (): Promise<Product[]> => {
    const listings = loadListingsFromStorage();
    return listings.filter(p => p.status === AdStatus.PENDING).sort((a,b) => b.createdAt - a.createdAt);
  },

  approveListing: async (id: string): Promise<Product | undefined> => {
    return listingService.updateListing(id, { status: AdStatus.ACTIVE, rejectionReason: undefined });
  },

  rejectListing: async (id: string, reason: string): Promise<Product | undefined> => {
    return listingService.updateListing(id, { status: AdStatus.REJECTED, rejectionReason: reason });
  },

  getCategoryName: (categoryId: string): string => {
    return CATEGORIES.find(c => c.id === categoryId)?.name || categoryId;
  },

  getSubcategoryName: (categoryId: string, subcategoryId: string): string => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    return category?.subcategories.find(sc => sc.id === subcategoryId)?.name || subcategoryId;
  }
};
