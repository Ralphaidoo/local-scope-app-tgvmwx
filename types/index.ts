
export type UserType = 'customer' | 'business' | 'admin';

export type SubscriptionPlan = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: UserType;
  phone?: string;
  avatar?: string;
  createdAt: string;
  subscriptionPlan?: SubscriptionPlan;
  businessListingCount?: number;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: BusinessCategory;
  borough: LondonBorough;
  neighborhood: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  images: string[];
  workingHours: WorkingHours;
  verified: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export type BusinessCategory = 
  | 'Food & Drink'
  | 'Retail'
  | 'Services'
  | 'Health & Beauty'
  | 'Home & Garden'
  | 'Professional Services'
  | 'Entertainment'
  | 'Education'
  | 'Automotive';

export type LondonBorough = 
  | 'City of London'
  | 'Westminster'
  | 'Camden'
  | 'Islington'
  | 'Hackney'
  | 'Tower Hamlets'
  | 'Greenwich'
  | 'Lewisham'
  | 'Southwark'
  | 'Lambeth'
  | 'Wandsworth'
  | 'Hammersmith and Fulham'
  | 'Kensington and Chelsea'
  | 'Barnet'
  | 'Brent'
  | 'Ealing'
  | 'Haringey'
  | 'Harrow'
  | 'Hillingdon'
  | 'Hounslow'
  | 'Richmond upon Thames'
  | 'Barking and Dagenham'
  | 'Bexley'
  | 'Bromley'
  | 'Croydon'
  | 'Enfield'
  | 'Kingston upon Thames'
  | 'Merton'
  | 'Newham'
  | 'Redbridge'
  | 'Sutton'
  | 'Waltham Forest'
  | 'Havering';

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  createdAt: string;
  requiresPro?: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  available: boolean;
  createdAt: string;
  requiresPro?: boolean;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  businessId: string;
  businessName: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  businessId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  deliveryAddress: string;
  promoCode?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  businessId: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  businessId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minimumAmount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  businessId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
}

export interface Wallet {
  id: string;
  businessId: string;
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  lastUpdated: string;
}

export interface WithdrawalRequest {
  id: string;
  businessId: string;
  amount: number;
  bankAccount: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  processedAt?: string;
  notes?: string;
}

export interface SearchFilters {
  query?: string;
  category?: BusinessCategory;
  borough?: LondonBorough;
  neighborhood?: string;
  verified?: boolean;
  rating?: number;
  sortBy?: 'rating' | 'date' | 'name';
}

export type ViewMode = 'grid' | 'list' | 'map';

export interface BoroughRegion {
  name: LondonBorough;
  businessCount: number;
  color: string;
  position: { x: number; y: number };
}

export interface PlatformAnalytics {
  id: string;
  date: string;
  totalUsers: number;
  newUsers: number;
  totalBusinesses: number;
  newBusinesses: number;
  totalOrders: number;
  totalBookings: number;
  totalRevenue: number;
  totalWithdrawals: number;
  activeUsers: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  details?: any;
  createdAt: string;
}
