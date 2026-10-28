/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { CartDrawer } from './components/CartDrawer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SensoryGuideSection } from './components/SensoryGuideSection';
import { StoreLocatorSection } from './components/StoreLocatorSection';
import { COFFEE_PRODUCTS } from './data/products';
import {
  CartItem,
  CoffeeProduct,
  LiveStorePlace,
  PlacedOrder,
  SelectedCustomizations,
} from './types/coffee';

const CART_STORAGE_KEY = 'lumi_roastery_cart_v1';
const ORDERS_STORAGE_KEY = 'lumi_roastery_orders_v1';

export default function App() {
  // Top-level Google Maps Demo Key quota state (persists across child mounts)
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<PlacedOrder[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as PlacedOrder[]) : [];
    } catch {
      return [];
    }
  });

  const [activeProductModal, setActiveProductModal] =
    useState<CoffeeProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  const [availableStores, setAvailableStores] = useState<LiveStorePlace[]>([]);
  const [selectedPickupStore, setSelectedPickupStore] =
    useState<LiveStorePlace | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleQuotaEvent = () => {
      setMapsQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaEvent);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaEvent);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage write errors in restricted browsing modes
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage write errors
    }
  }, [orders]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const handleStoresLoaded = useCallback((loaded: LiveStorePlace[]) => {
    setAvailableStores(loaded);
    setSelectedPickupStore((prev) => prev || loaded[0] || null);
  }, []);

  const handleSelectPickupStore = useCallback(
    (store: LiveStorePlace) => {
      setSelectedPickupStore(store);
      showToast(`已將「${store.name}」設為您的自取門市`);
    },
    [showToast]
  );

  const handleAddToCart = useCallback(
    (
      product: CoffeeProduct,
      customizations: SelectedCustomizations,
      quantity: number
    ) => {
      const optionKey = Object.entries(customizations)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([gId, choice]) => `${gId}:${choice.id}`)
        .join('|');
      const cartItemId = `${product.id}__${optionKey}`;

      const extraPrice = Object.values(customizations).reduce(
        (sum, c) => sum + (c?.priceDelta || 0),
        0
      );
      const unitFinalPrice = product.basePrice + extraPrice;

      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.cartItemId === cartItemId
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }
        return [
          ...prev,
          {
            cartItemId,
            product,
            quantity,
            customizations,
            unitFinalPrice,
          },
        ];
      });

      showToast(`已加入訂購清單：${product.name} × ${quantity}`);
    },
    [showToast]
  );

  const handleQuickAdd = useCallback(
    (product: CoffeeProduct) => {
      const defaultCustomizations: SelectedCustomizations = {};
      product.customizationGroups.forEach((group) => {
        if (group.choices[0]) {
          defaultCustomizations[group.id] = group.choices[0];
        }
      });
      handleAddToCart(product, defaultCustomizations, 1);
    },
    [handleAddToCart]
  );

  const handleUpdateQuantity = useCallback(
    (cartItemId: string, delta: number) => {
      setCartItems((prev) =>
        prev
          .map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const handleRemoveItem = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  }, []);

  const handlePlaceOrder = useCallback((newOrder: PlacedOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
  }, []);

  const handleReorder = useCallback(
    (order: PlacedOrder) => {
      setCartItems((prev) => {
        const merged = [...prev];
        order.items.forEach((orderItem) => {
          const idx = merged.findIndex(
            (m) => m.cartItemId === orderItem.cartItemId
          );
          if (idx >= 0) {
            merged[idx] = {
              ...merged[idx],
              quantity: merged[idx].quantity + orderItem.quantity,
            };
          } else {
            merged.push({ ...orderItem });
          }
        });
        return merged;
      });
      setIsCartOpen(true);
      showToast(`已將訂單 #${order.orderNumber} 品項重新加入購物袋`);
    },
    [showToast]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.unitFinalPrice * item.quantity,
        0
      ),
    [cartItems]
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F7] text-zinc-900">
      {/* Required Google Maps Platform Demo Quota Banner (only shown if quota reached) */}
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* 3-Zone Top Navigation Bar */}
      <Navbar
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        orderCount={orders.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Section 1: Storefront Hero */}
        <HeroSection
          onExploreCatalog={() => scrollToSection('catalog')}
          onExploreLocations={() => scrollToSection('locations')}
        />

        {/* Section 2: Coffee Product Catalog & Customization */}
        <ProductCatalog
          products={COFFEE_PRODUCTS}
          onSelectProduct={(product) => setActiveProductModal(product)}
          onQuickAdd={handleQuickAdd}
        />

        {/* Section 3: Roast Curve Sensory Guide & Testimonials */}
        <SensoryGuideSection
          onSelectProduct={(product) => setActiveProductModal(product)}
        />

        {/* Section 4: Store Geographical Location & Interactive Google Maps */}
        <StoreLocatorSection
          selectedPickupStore={selectedPickupStore}
          onStoresLoaded={handleStoresLoaded}
          onSelectPickupStore={handleSelectPickupStore}
        />
      </main>

      {/* Clean Architectural Footer */}
      <footer className="border-t border-zinc-200 bg-[#FAF9F7] py-12">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-display text-lg font-semibold text-zinc-900">
              嶼光咖啡焙煎所 Lumi Roastery
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              精品單品微批次烘焙 · 職人手沖吧台 · 線上預訂快取與全台宅配
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-600">
            <a
              href="#catalog"
              className="hover:text-zinc-900 transition-colors whitespace-nowrap"
            >
              嚴選咖啡豆單
            </a>
            <a
              href="#craft"
              className="hover:text-zinc-900 transition-colors whitespace-nowrap"
            >
              焙煎風味指南
            </a>
            <a
              href="#locations"
              className="hover:text-zinc-900 transition-colors whitespace-nowrap"
            >
              門市地圖導覽
            </a>
            <button
              type="button"
              onClick={() => setIsOrderHistoryOpen(true)}
              className="hover:text-zinc-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              線上訂單查詢
            </button>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hover:text-zinc-900 transition-colors whitespace-nowrap cursor-pointer"
            >
              購物袋結帳
            </button>
          </div>
        </div>

        <div className="max-w-[1240px] mx-auto px-6 lg:px-10 mt-8 pt-6 border-t border-zinc-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} 嶼光咖啡焙煎所 Lumi Roastery. 保留所有權利。</p>
          <p>
            單筆滿 NT$800 享免運優惠 · 門市自備環保隨行杯折抵 NT$5
          </p>
        </div>
      </footer>

      {/* Non-intrusive Cart Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-zinc-900 text-white px-4 py-3 rounded-xl shadow-lg text-xs sm:text-sm"
        >
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="ml-2 underline font-medium text-emerald-300 hover:text-white whitespace-nowrap cursor-pointer"
          >
            查看購物袋
          </button>
        </div>
      )}

      {/* Product Detail & Customization Modal */}
      <ProductDetailModal
        product={activeProductModal}
        onClose={() => setActiveProductModal(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Online Ordering Cart & Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        availableStores={availableStores}
        selectedStore={selectedPickupStore}
        onSelectStore={handleSelectPickupStore}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* Order Lookup & History Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        orders={orders}
        onClose={() => setIsOrderHistoryOpen(false)}
        onReorder={handleReorder}
      />
    </div>
  );
}
