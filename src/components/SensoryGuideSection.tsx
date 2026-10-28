import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  COFFEE_PRODUCTS,
  ROAST_GUIDE_ENTRIES,
  TESTIMONIALS,
} from '../data/products';
import { CoffeeProduct } from '../types/coffee';

interface SensoryGuideSectionProps {
  onSelectProduct: (product: CoffeeProduct) => void;
}

export const SensoryGuideSection: React.FC<SensoryGuideSectionProps> = ({
  onSelectProduct,
}) => {
  const [activeRoastId, setActiveRoastId] = useState<string>(
    ROAST_GUIDE_ENTRIES[0].id
  );

  const activeEntry =
    ROAST_GUIDE_ENTRIES.find((r) => r.id === activeRoastId) ||
    ROAST_GUIDE_ENTRIES[0];

  const handleOpenRecommended = () => {
    const matched = COFFEE_PRODUCTS.find(
      (p) => p.id === activeEntry.recommendedProductId
    );
    if (matched) {
      onSelectProduct(matched);
    }
  };

  return (
    <section
      id="craft"
      className="border-t border-zinc-200/80 bg-[#FAF9F7] py-16 lg:py-24"
    >
      <div className="max-w-[1240px] mx-auto px-6 lg:px-10">
        {/* Interactive Roast & Extraction Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium text-zinc-500 mb-2">
              全熱風微量烘焙工藝 · 挑選最適合您的日常風味光譜
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-zinc-900 tracking-tight text-balance">
              三階段烘焙曲線與萃取風味指南
            </h2>
            <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
              我們以 Loring S15 Falcon 全熱風智能烘焙機精確控制梅納反應與發展期比例，每週進行三次盲測杯測（Cupping），確保每一鍋熟豆皆呈現乾淨透明的甜感。
            </p>

            {/* Vertical Interactive Selector Buttons */}
            <div
              role="tablist"
              aria-label="烘焙曲線選擇"
              className="mt-8 space-y-2.5"
            >
              {ROAST_GUIDE_ENTRIES.map((entry) => {
                const isSelected = entry.id === activeRoastId;
                return (
                  <button
                    key={entry.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveRoastId(entry.id)}
                    className={`w-full text-left px-4 py-3.5 min-h-[48px] rounded-xl border transition-colors duration-150 cursor-pointer flex items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-white border-[#1F4E3D] text-zinc-900 shadow-xs'
                        : 'bg-transparent border-zinc-200 text-zinc-600 hover:bg-white/60 hover:text-zinc-900'
                    }`}
                  >
                    <span className="text-sm font-semibold whitespace-nowrap">
                      {entry.indexLabel}
                    </span>
                    <span className="font-mono text-xs text-zinc-500 tabular-nums truncate">
                      {entry.roastRatio}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Dynamic Roast Data Card */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-500 tabular-nums">
              <span>{activeEntry.agtron}</span>
              <span aria-hidden="true">·</span>
              <span>{activeEntry.roastRatio}</span>
              <span aria-hidden="true">·</span>
              <span>{activeEntry.waterTemp}</span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900 mt-3 text-balance">
              {activeEntry.title}
            </h3>

            <p className="mt-4 text-sm sm:text-base text-zinc-600 leading-relaxed">
              {activeEntry.description}
            </p>

            {/* 3-Column Sensory Attributes */}
            <div className="mt-6 pt-6 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <p className="text-xs text-zinc-500">酸質表現</p>
                <p className="text-sm font-semibold text-zinc-900 mt-1">
                  {activeEntry.acidityText}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">甜感轉化</p>
                <p className="text-sm font-semibold text-zinc-900 mt-1">
                  {activeEntry.sweetnessText}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">口感質地</p>
                <p className="text-sm font-semibold text-zinc-900 mt-1">
                  {activeEntry.bodyText}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500">代表風味輪廓</p>
                <p className="text-sm font-medium text-zinc-800 mt-0.5">
                  {activeEntry.aromaSpectrum}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenRecommended}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>選購代表品：{activeEntry.recommendedLabel}</span>
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* Claim-to-Proof Adjacency: Attributable Testimonials */}
        <div className="mt-14 pt-12 border-t border-zinc-200">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
            <h3 className="font-display text-xl sm:text-2xl font-semibold text-zinc-900">
              杯測師與企業夥伴品飲回饋
            </h3>
            <p className="text-xs text-zinc-500 tabular-nums">
              2026 年度門市與企業熟豆訂閱回購率達 84.6%
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {TESTIMONIALS.map((item) => (
              <blockquote
                key={item.id}
                className="bg-white border border-zinc-200/90 rounded-xl p-6 flex flex-col justify-between"
              >
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">
                  「{item.quote}」
                </p>
                <footer className="mt-5 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-zinc-900">
                      {item.authorName}
                    </span>
                    <span className="mx-1.5 text-zinc-400" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-zinc-600">
                      {item.role}（{item.organization}）
                    </span>
                  </div>
                  <span className="text-zinc-500 tabular-nums whitespace-nowrap">
                    {item.metricContext}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
