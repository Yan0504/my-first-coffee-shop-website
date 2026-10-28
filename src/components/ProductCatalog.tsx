import React, { useMemo, useState } from 'react';
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react';
import {
  CoffeeProduct,
  ProductCategory,
  RoastLevel,
} from '../types/coffee';
import { SafeImage } from './SafeImage';

interface ProductCatalogProps {
  products: CoffeeProduct[];
  onSelectProduct: (product: CoffeeProduct) => void;
  onQuickAdd: (product: CoffeeProduct) => void;
}

type CategoryFilter = 'ALL' | ProductCategory;
type RoastFilter = 'ALL' | RoastLevel;

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [roastFilter, setRoastFilter] = useState<RoastFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) {
        return false;
      }
      if (roastFilter !== 'ALL' && item.roastLevel !== roastFilter) {
        return false;
      }
      if (q) {
        const haystack = [
          item.name,
          item.englishSubtitle,
          item.origin,
          item.roastLevel,
          item.process,
          ...item.flavorNotes,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
  }, [products, categoryFilter, roastFilter, searchQuery]);

  const freshDrinks = useMemo(
    () => filteredProducts.filter((p) => p.category === ProductCategory.FRESH_DRINK),
    [filteredProducts]
  );

  const roastedBeans = useMemo(
    () => filteredProducts.filter((p) => p.category === ProductCategory.ROASTED_BEANS),
    [filteredProducts]
  );

  const resetFilters = () => {
    setCategoryFilter('ALL');
    setRoastFilter('ALL');
    setSearchQuery('');
  };

  return (
    <section
      id="catalog"
      className="border-t border-zinc-200/80 bg-white py-16 lg:py-24"
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">
              咖啡產品簡介與線上訂購 · 點擊品項可檢視沖煮參數與客製選項
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900 tracking-tight text-balance">
              當季嚴選單品與職人咖啡系列
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋風味或產區，如：佛手柑、藝伎..."
              aria-label="搜尋咖啡品項"
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1F4E3D] focus:ring-1 focus:ring-[#1F4E3D] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="清除搜尋關鍵字"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Interactive Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-10 border-b border-zinc-200">
          {/* Segmented Category Filter */}
          <div
            role="group"
            aria-label="產品類別篩選"
            className="inline-flex items-center gap-1 p-1 bg-[#F4F3F0] rounded-lg overflow-x-auto max-w-full"
          >
            {(
              [
                { value: 'ALL', label: '全部系列' },
                { value: ProductCategory.FRESH_DRINK, label: '現萃手沖與義式' },
                { value: ProductCategory.ROASTED_BEANS, label: '莊園熟豆與禮盒' },
              ] as const
            ).map((tab) => {
              const active = categoryFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setCategoryFilter(tab.value)}
                  className={`px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Segmented Roast Level Filter */}
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 whitespace-nowrap shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              烘焙度：
            </span>
            <div
              role="group"
              aria-label="烘焙度篩選"
              className="inline-flex items-center gap-1 p-1 bg-[#F4F3F0] rounded-lg"
            >
              {(
                [
                  { value: 'ALL', label: '全部焙度' },
                  { value: RoastLevel.LIGHT, label: '淺焙花果' },
                  { value: RoastLevel.MEDIUM, label: '中焙平衡' },
                  { value: RoastLevel.MEDIUM_DARK, label: '中深醇厚' },
                ] as const
              ).map((roast) => {
                const active = roastFilter === roast.value;
                return (
                  <button
                    key={roast.value}
                    type="button"
                    onClick={() => setRoastFilter(roast.value)}
                    className={`px-3 py-1.5 min-h-[36px] text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-zinc-900 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    {roast.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Empty Filter State */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-[#FAF9F7] rounded-xl border border-zinc-200 px-6">
            <p className="text-base font-semibold text-zinc-900">
              找不到符合目前篩選條件的咖啡品項
            </p>
            <p className="mt-1.5 text-sm text-zinc-600">
              請嘗試切換不同烘焙度，或清除關鍵字檢視完整當季豆單。
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 px-4 py-2 min-h-[40px] text-sm font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              重設篩選條件
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Collection 1: Freshly Brewed Drinks (3-Column Grid) */}
            {freshDrinks.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
                  <h3 className="font-display text-2xl font-semibold text-zinc-900">
                    01. 門市現萃手沖與義式特調
                  </h3>
                  <p className="text-xs text-zinc-500">
                    現點現磨萃取 · 自備環保杯結帳再折 NT$5 / 杯
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {freshDrinks.map((product) => (
                    <article
                      key={product.id}
                      className="group flex flex-col justify-between bg-[#FAF9F7] border border-zinc-200/90 rounded-xl p-4 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div>
                        {/* 4:3 Studio Product Photography */}
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="block w-full aspect-[4/3] rounded-lg overflow-hidden bg-[#ECE9E2] mb-4 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-[#1F4E3D]"
                        >
                          <SafeImage
                            src={product.imageUrl}
                            alt={product.name}
                            fallbackLabel={product.name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                          />
                        </button>

                        {/* Unboxed Clean Metadata with Separators */}
                        <div className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-500 mb-1.5">
                          <span>{product.roastLevel}</span>
                          <span aria-hidden="true">·</span>
                          <span>{product.unitLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#1F4E3D] font-medium">
                            {product.statusNote}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="text-left block w-full cursor-pointer group/title"
                        >
                          <h4 className="text-base font-semibold text-zinc-900 group-hover/title:text-[#1F4E3D] transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5 truncate">
                            {product.flavorNotes.join(' / ')}
                          </p>
                        </button>

                        <p className="mt-3 text-sm text-zinc-600 leading-relaxed line-clamp-2">
                          {product.shortDescription}
                        </p>
                      </div>

                      {/* Aligned Baseline Price & Actions */}
                      <div className="mt-5 pt-4 border-t border-zinc-200/80 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-xs text-zinc-500 block">單杯售價</span>
                          <span className="font-mono text-base font-medium text-zinc-900 tabular-nums">
                            NT${product.basePrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSelectProduct(product)}
                            className="px-3 py-2 min-h-[40px] text-xs font-medium text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            風味與客製
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickAdd(product)}
                            aria-label={`快速加入 ${product.name}`}
                            className="inline-flex items-center gap-1 px-3.5 py-2 min-h-[40px] text-xs font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 shrink-0" />
                            <span>加入</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Secondary Collection 2: Whole Beans & Drip Gift Box (2-Column Editorial Showcase) */}
            {roastedBeans.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
                  <h3 className="font-display text-2xl font-semibold text-zinc-900">
                    02. 自家鮮烘莊園熟豆與濾掛禮盒
                  </h3>
                  <p className="text-xs text-zinc-500">
                    提供免費依沖煮器材代客研磨 · 支援門市自取與全台宅配
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {roastedBeans.map((product) => (
                    <article
                      key={product.id}
                      className="group flex flex-col sm:flex-row gap-6 bg-[#FAF9F7] border border-zinc-200/90 rounded-xl p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* 4:3 Image Container */}
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="w-full sm:w-56 md:w-64 aspect-[4/3] sm:aspect-auto sm:h-auto rounded-lg overflow-hidden bg-[#ECE9E2] shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1F4E3D]"
                      >
                        <SafeImage
                          src={product.imageUrl}
                          alt={product.name}
                          fallbackLabel={product.name}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                      </button>

                      {/* Product Content */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-500 mb-1.5">
                            <span>{product.roastLevel}</span>
                            <span aria-hidden="true">·</span>
                            <span>{product.unitLabel}</span>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#1F4E3D] font-medium">
                              {product.statusNote}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onSelectProduct(product)}
                            className="text-left block w-full cursor-pointer group/title"
                          >
                            <h4 className="text-lg font-semibold text-zinc-900 group-hover/title:text-[#1F4E3D] transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs text-zinc-500 mt-1">
                              {product.flavorNotes.join(' / ')}
                            </p>
                          </button>

                          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
                            {product.shortDescription}
                          </p>

                          <p className="mt-2.5 text-xs text-zinc-500">
                            產區配置：{product.origin}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-zinc-200/80 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-zinc-500 block">起始售價</span>
                            <span className="font-mono text-base font-medium text-zinc-900 tabular-nums">
                              NT${product.basePrice.toLocaleString()} 起
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => onSelectProduct(product)}
                              className="px-3.5 py-2 min-h-[40px] text-xs font-medium text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              選擇豆款與研磨
                            </button>
                            <button
                              type="button"
                              onClick={() => onQuickAdd(product)}
                              className="inline-flex items-center gap-1 px-3.5 py-2 min-h-[40px] text-xs font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 shrink-0" />
                              <span>加入</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
