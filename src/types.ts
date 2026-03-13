import { 
  Home, 
  Calendar, 
  Menu as MenuIcon, 
  User, 
  ArrowLeft, 
  Search, 
  Share2, 
  Star, 
  Timer, 
  ChevronRight, 
  Check, 
  Info, 
  Phone, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Edit2, 
  ArrowRight,
  ShieldCheck,
  ShoppingBasket,
  Utensils,
  Trash2,
  Ticket,
  HelpCircle,
  ChevronDown
} from 'lucide-react';

export type Page = 'home' | 'menu' | 'cart' | 'address' | 'tracking' | 'faq' | 'safety' | 'login' | 'orders' | 'referral' | 'wallet' | 'rating';

export interface Service {
  id: string;
  duration: string;
  price: number;
  originalPrice: number;
  discount: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  isNonVeg?: boolean;
}

export const MENU_CATEGORIES = [
  'Breakfast',
  'Bread, Rice & Salad',
  'Veg Main Course',
  'Non-veg Main Course',
  'Sides / Desserts',
];

export const SERVICES: Service[] = [
  { id: '1', duration: '1 hour', price: 199, originalPrice: 406, discount: '51% OFF' },
  { id: '2', duration: '1.5 hours', price: 298, originalPrice: 608, discount: '51% OFF' },
  { id: '3', duration: '2 hours', price: 398, originalPrice: 812, discount: '51% OFF' },
  { id: '4', duration: '2.5 hours', price: 497, originalPrice: 1014, discount: '51% OFF' },
  { id: '5', duration: '3 hours', price: 597, originalPrice: 1218, discount: '51% OFF' },
  { id: '6', duration: '3.5 hours', price: 696, originalPrice: 1420, discount: '51% OFF' },
  { id: '7', duration: '4 hours', price: 796, originalPrice: 1624, discount: '51% OFF' },
];

export interface MultiDayOption {
  days: number;
  label: string;
  discountPercent: number;
}

export const MULTI_DAY_OPTIONS: MultiDayOption[] = [
  { days: 5,  label: '5 days',  discountPercent: 5 },
  { days: 7,  label: '7 days',  discountPercent: 8 },
  { days: 10, label: '10 days', discountPercent: 10 },
  { days: 15, label: '15 days', discountPercent: 12 },
  { days: 20, label: '20 days', discountPercent: 15 },
  { days: 26, label: '26 days', discountPercent: 18 },
];

export interface BookingInfo {
  mode: 'now' | 'later' | 'multi-day';
  multiDayCount?: number;
  multiDayDiscount?: number;
}

// Reusable image references
const IMG = {
  aloo_paratha: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2vIT34MJyPkSBh8fvZsHaSD6FnZvfhYMas9VfuXLX6Z4NoS5M9Gb2Etb2cTBB2XHmA1L9FX2G0C7DZJbv497HChs4tyiozCtErWsMRVxQPpARMjvJwoL4sj6QJHO8nDi-A5suf7GIZ0tE_1GkQcacJtSnfNp154KCzQoS2mZ8BRVyaEVpghcnvBd4fpaRf59WylmCEbZOaO_82YUnYSBus-_wlq1KIORhHl1_T_lMRUjahpKQmhNrxWlUU9ylvZJDg6W_yjctYnZr',
  matar_paneer: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJo4frOI4GJUV9lE_6USd00SB2oAieWTJn7x9aMYgCLItrMX5Wi3HXv9k03DXlgl-zqOfg2FN3L7TjmPeihB37TZV0dzEutX1zcrEFu18zO0Hp3qXcfeiHTZT_IONRjNQ0zFZFH4FDSbJFmIuaPGshQ6s6XN00BtxVy-RRvKyyGtaB7unQ19ukq2vgXDwP2xfAz02TC6QO_inXrsDGC5ID80AkXbk-Ny0H4tSsdVW2yui2U_JLMc8cPUD3i6YL8HjfBMRDQMUFqT28',
  khichdi: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCuSkvGx3rbOLPG7nnm-R-aUjad_Xg9cnuj7yN_bysACH-giw2190TEO5k9Hj0Q9gky-leSD5rXlAYlicCGNRg9fPO68Va0cD8x5QpQIJ2eeCMvbtHi-7BDiHhsHR1ZMzqfPaL84sBUOTu8KVPheq3OjQiHnCZ09pBVYVODY2rpoK0lq4FsS032FN-E3gId9xATClQHXg76heF7S_QnjD7GuTjq04BrEuq-BTJuXIDFGOZ_QZ7lVSi_A5L-TFD6HAqhJ0_ToYh_ERNR',
  dosa: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZQkSJLj19On53PMqy7PhJUqFWFgL4xsY6ZUjJIpwRDHHoUg02H1DKqDa77lpu85sgaswD0tzrfthD5mhPvL5zklZRJTI-QNKMVgG74DD_REZcn8PoXGI4TQdSC8bsLolg1eMnLn866DZ1bl0367bEDPRH7rEhkFnAGT9hAcrOuCP7cZfp36A7NzH0ajMgxL8oZ8Q5x09G9kR-nr8waj-3Og_9_bDenAJjY9D5V59ScXaC7PdbNFtijKLEGryDvsMhocFNrZRfBXs3',
  poha: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9RZ-TCZb63MiBKFHV6B0VXY0EeO7ltF4bFLiltW4fEowamDFLnqVH_FrVRwv5MrKDEIcUQISob74_7nBsba-rpfge0zyW_vUW-wJGGUCkvwTDeDj4S-iIa3LXg9armFDjTa2gqmevioyqq8Q8Dj9xwgWV1-ZqHIs0i7GI_GiQT9Q4S1BTGNzh9d3ihb71w1lfm93r9E_G7CXnXKMEFG1P0BWlr0Cez34nTaAqfIZdJJs6OwMu_L76K3y19VWkL4ZYlKZpEY9FU-9i',
  omelette: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBup2PwIISygMNRO2ibb6oi1d6o-EFx-f0NbExXOxNxS--EPqpBGgXKPPsi9sTw5rT0G9tv6-IiWqP_QqnoAuXI1PyV1fWbuXThyYlFZgu0UvlEEO8O5Abd4U_D8yglcPHfZF8KjXmLe4zLFkcBt26jXSqwLDkETlYy6n-8XrdA1UV9KwsK9Gt1ucSdyUBwVTjsYNPZ_rcqeKAL3ld2ZpQ1g5urSNEPR519LHEFLtRfXNYxJ1oX9a54zzLgRZM52Hz8OTvcA-V64wKz',
};

export const MENU_ITEMS: MenuItem[] = [
  // --- Breakfast ---
  { id: 'm1', name: 'Dosa & Sambar', description: 'Traditional South Indian dosa with sambar', category: 'Breakfast', image: IMG.dosa },
  { id: 'm2', name: 'Poha', description: 'Flaked rice dish with peanuts & coriander', category: 'Breakfast', image: IMG.poha },
  { id: 'm3', name: 'Omelette', description: 'Fluffy masala omelette', category: 'Breakfast', image: IMG.omelette },
  { id: 'm4', name: 'Besan Chilla', description: 'Savory gram flour pancake', category: 'Breakfast', image: IMG.omelette },
  { id: 'm5', name: 'Paneer Parantha', description: 'Stuffed paneer paratha with butter', category: 'Breakfast', image: IMG.aloo_paratha },
  { id: 'm6', name: 'Aloo Parantha', description: 'Stuffed potato paratha with butter', category: 'Breakfast', image: IMG.aloo_paratha },

  // --- Bread, Rice & Salad ---
  { id: 'm7', name: 'Plain/Laccha Parantha', description: 'Layered flaky paratha', category: 'Bread, Rice & Salad', image: IMG.aloo_paratha },
  { id: 'm8', name: 'Chappati', description: 'Soft whole wheat flatbread', category: 'Bread, Rice & Salad', image: IMG.aloo_paratha },
  { id: 'm9', name: 'Puri', description: 'Deep fried puffed bread', category: 'Bread, Rice & Salad', image: IMG.aloo_paratha },
  { id: 'm10', name: 'Rice / Jira Rice', description: 'Steamed rice with cumin tempering', category: 'Bread, Rice & Salad', image: IMG.khichdi },
  { id: 'm11', name: 'Khichdi', description: 'Nutritious dal-rice one pot meal', category: 'Bread, Rice & Salad', image: IMG.khichdi },
  { id: 'm12', name: 'Cut Fruits / Salad', description: 'Fresh seasonal fruits or salad', category: 'Bread, Rice & Salad', image: IMG.poha },

  // --- Veg Main Course ---
  { id: 'm13', name: 'Matar Paneer', description: 'Peas and cottage cheese in gravy', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm14', name: 'Palak Paneer', description: 'Cottage cheese in spinach gravy', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm15', name: 'Paneer Bhurji', description: 'Scrambled cottage cheese with spices', category: 'Veg Main Course', image: IMG.omelette },
  { id: 'm16', name: 'Rajma', description: 'Kidney beans in tomato gravy', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm17', name: 'Chole', description: 'Chickpea curry with warm spices', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm18', name: 'Dal Tadka', description: 'Yellow lentils with cumin tempering', category: 'Veg Main Course', image: IMG.khichdi },
  { id: 'm19', name: 'Aloo Beans', description: 'Potato and green beans stir fry', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm20', name: 'Patta Gobhi', description: 'Stir fried cabbage with spices', category: 'Veg Main Course', image: IMG.poha },
  { id: 'm21', name: 'Phool Gobhi', description: 'Cauliflower dry or semi-gravy', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm22', name: 'Dum Aloo', description: 'Baby potatoes in rich gravy', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm23', name: 'Bhindi Masala', description: 'Okra stir fried with onions & spices', category: 'Veg Main Course', image: IMG.matar_paneer },
  { id: 'm24', name: 'Mix Vegetable', description: 'Seasonal mixed vegetable curry', category: 'Veg Main Course', image: IMG.matar_paneer },

  // --- Non-veg Main Course ---
  { id: 'm25', name: 'Chicken Curry', description: 'Home-style chicken curry', category: 'Non-veg Main Course', image: IMG.matar_paneer, isNonVeg: true },
  { id: 'm26', name: 'Egg Curry', description: 'Boiled eggs in spiced onion gravy', category: 'Non-veg Main Course', image: IMG.matar_paneer, isNonVeg: true },
  { id: 'm27', name: 'Egg Bhurji', description: 'Scrambled eggs Indian style', category: 'Non-veg Main Course', image: IMG.omelette, isNonVeg: true },

  // --- Sides / Desserts ---
  { id: 'm28', name: 'Tea / Coffee', description: 'Hot masala chai or filter coffee', category: 'Sides / Desserts', image: IMG.poha },
  { id: 'm29', name: 'Raita / Chutney', description: 'Cool yogurt raita or fresh chutney', category: 'Sides / Desserts', image: IMG.poha },
  { id: 'm30', name: 'Sooji ka Halwa', description: 'Sweet semolina dessert with ghee', category: 'Sides / Desserts', image: IMG.omelette },
];
