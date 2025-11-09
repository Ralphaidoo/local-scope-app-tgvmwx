
export type UserType = 'customer' | 'business_user' | 'admin';
export type SubscriptionPlan = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'expired';

export interface User {
  id: string;
  email: string;
  fullName: string;
  userType: UserType;
  phone?: string;
  createdAt: string;
  subscriptionPlan: SubscriptionPlan;
  businessListingCount: number;
}

export type BusinessCategory = 
  | 'restaurant' 
  | 'retail' 
  | 'services' 
  | 'health' 
  | 'beauty' 
  | 'fitness' 
  | 'automotive' 
  | 'education' 
  | 'entertainment' 
  | 'professional';

export type LondonBorough = 
  | 'Barking and Dagenham'
  | 'Barnet'
  | 'Bexley'
  | 'Brent'
  | 'Bromley'
  | 'Camden'
  | 'City of London'
  | 'Croydon'
  | 'Ealing'
  | 'Enfield'
  | 'Greenwich'
  | 'Hackney'
  | 'Hammersmith and Fulham'
  | 'Haringey'
  | 'Harrow'
  | 'Havering'
  | 'Hillingdon'
  | 'Hounslow'
  | 'Islington'
  | 'Kensington and Chelsea'
  | 'Kingston upon Thames'
  | 'Lambeth'
  | 'Lewisham'
  | 'Merton'
  | 'Newham'
  | 'Redbridge'
  | 'Richmond upon Thames'
  | 'Southwark'
  | 'Sutton'
  | 'Tower Hamlets'
  | 'Waltham Forest'
  | 'Wandsworth'
  | 'Westminster';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  description: string;
  shortDescription?: string;
  boroughs: LondonBorough[];
  neighborhoods?: string[];
  phone?: string;
  email?: string;
  website?: string;
  imageUrls: string[];
  latitude?: number;
  longitude?: number;
  featured: boolean;
  verified: boolean;
  averageRating: number;
  reviewCount: number;
  workingHours?: Record<string, { open: string; close: string }>;
  createdAt: string;
  ownerId: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  imageUrls: string[];
  inStock: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes?: number;
  category?: string;
  imageUrls: string[];
  available: boolean;
}

export interface Review {
  id: string;
  businessId: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  verified: boolean;
  createdAt: string;
}

export interface CartItem {
  id: string;
  businessId: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  priceAtTime: number;
  name: string;
  image?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  businessId: string;
  status: OrderStatus;
  totalAmount: number;
  paymentStatus: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string;
  serviceId?: string;
  quantity: number;
  priceAtTime: number;
  name: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  businessId: string;
  serviceId?: string;
  bookingDate: string;
  bookingTime: string;
  durationMinutes: number;
  status: BookingStatus;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
}

export type ViewMode = 'grid' | 'list' | 'map';
