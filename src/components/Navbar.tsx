import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  cartSubtotal: number;
  orderCount: number;
  onOpenCart: () => void;
  onOpenOrderHistory: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartSubtotal,
  orderCount,
  onOpenCart,
  onOpenOrderHistory,
}) => {
  return (
    <header className="sticky top-0 z-40 h-16 bg-[#FAF9F7]/95 backdrop-blur-md border-b border-zinc-200/80">
      <div className="max-w-[1240px] mx-auto h-full px-6 lg:px-10 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-xl lg:text-2xl font-semibold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F4E3D]"
        >
          嶼光咖啡焙煎所
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="主要導覽"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          <a
            href="#catalog"
            className="hover:text-zinc-900 hover:underline underline-offset-8 transition-colors duration-150 whitespace-nowrap shrink-0 py-1"
          >
            嚴選咖啡
          </a>
          <a
            href="#craft"
            className="hover:text-zinc-900 hover:underline underline-offset-8 transition-colors duration-150 whitespace-nowrap shrink-0 py-1"
          >
            焙煎風味
          </a>
          <a
            href="#locations"
            className="hover:text-zinc-900 hover:underline underline-offset-8 transition-colors duration-150 whitespace-nowrap shrink-0 py-1"
          >
            門市地圖
          </a>
          <button
            type="button"
            onClick={onOpenOrderHistory}
            className="hover:text-zinc-900 hover:underline underline-offset-8 transition-colors duration-150 whitespace-nowrap shrink-0 py-1 cursor-pointer tabular-nums"
          >
            {orderCount > 0 ? `訂單紀錄 (${orderCount})` : '訂單查詢'}
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 min-h-[40px] text-xs sm:text-sm font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] active:scale-[0.99] rounded-lg transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4E3D] tabular-nums"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>
              {cartCount > 0
                ? `線上訂購 (${cartCount}) · NT$${cartSubtotal.toLocaleString()}`
                : '線上訂購'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
