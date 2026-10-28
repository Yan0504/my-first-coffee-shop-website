export enum ProductCategory {
  FRESH_DRINK = 'FRESH_DRINK',
  ROASTED_BEANS = 'ROASTED_BEANS',
}

export enum RoastLevel {
  LIGHT = '淺焙',
  MEDIUM = '中焙',
  MEDIUM_DARK = '中深焙',
}

export enum FulfillmentMethod {
  PICKUP = 'PICKUP',
  DELIVERY = 'DELIVERY',
}

export enum PaymentMethod {
  PAY_AT_PICKUP = '到店取餐付款',
  CREDIT_CARD = '信用卡線上付款',
  LINE_PAY = 'LINE Pay 行動支付',
  COD = '貨到付款 (COD)',
}

export interface CustomizationChoice {
  id: string;
  label: string;
  priceDelta: number;
}

export interface CustomizationGroup {
  id: string;
  name: string;
  required: boolean;
  choices: CustomizationChoice[];
}

export interface SensoryProfile {
  acidity: number; // 1 to 5
  sweetness: number; // 1 to 5
  body: number; // 1 to 5
}

export interface BrewingRecipe {
  method: string;
  ratio: string;
  waterTemp: string;
  brewTime: string;
  grindNote: string;
}

export interface CoffeeProduct {
  id: string;
  code: string;
  name: string;
  englishSubtitle: string;
  category: ProductCategory;
  roastLevel: RoastLevel;
  origin: string;
  altitude: string;
  process: string;
  varietal: string;
  flavorNotes: string[];
  shortDescription: string;
  story: string;
  basePrice: number;
  unitLabel: string;
  statusNote: string;
  imageUrl: string;
  sensory: SensoryProfile;
  brewingRecipe: BrewingRecipe;
  customizationGroups: CustomizationGroup[];
}

export interface SelectedCustomizations {
  [groupId: string]: CustomizationChoice;
}

export interface CartItem {
  cartItemId: string;
  product: CoffeeProduct;
  quantity: number;
  customizations: SelectedCustomizations;
  unitFinalPrice: number;
}

export interface LiveStorePlace {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingCount?: number;
  phoneNumber?: string;
  googleMapsURI?: string;
  isOpenText?: string;
  weekdayHours?: string[];
}

export interface PlacedOrder {
  orderNumber: string;
  createdAt: string;
  fulfillment: FulfillmentMethod;
  pickupStoreName?: string;
  pickupStoreAddress?: string;
  pickupWindow?: string;
  deliveryAddress?: string;
  postalCode?: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  ecoCupCount: number;
  ecoDiscount: number;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  note?: string;
  items: CartItem[];
  status: '已成立訂單 · 準備磨豆萃取' | '職人手沖製作中' | '已完成可取餐 / 配送中';
}
