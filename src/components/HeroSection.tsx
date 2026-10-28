import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { HERO_IMAGE_URL } from '../data/products';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onExploreLocations: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
  onExploreLocations,
}) => {
  return (
    <section
      id="top"
      className="max-w-[1240px] mx-auto px-6 lg:px-10 pt-8 lg:pt-12 pb-14 lg:pb-20"
    >
      {/* 2-Column Balanced Split Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Editorial Column */}
        <div className="lg:col-span-6 flex flex-col justify-between py-2 lg:py-6">
          <div>
            <p className="text-xs sm:text-[13px] font-medium text-zinc-500 tracking-normal mb-4">
              台北自家微量烘焙 · SCA 認證杯測師監製 · 當日鮮萃外帶與熟豆宅配
            </p>

            <h1 className="font-display text-[clamp(2.25rem,3.8vw,3.5rem)] font-semibold leading-[1.16] tracking-tight text-zinc-900 max-w-xl text-balance">
              以精準慢火，封存高海拔莊園的純淨風土
            </h1>

            <p className="mt-6 text-base leading-[1.7] text-zinc-600 max-w-[54ch]">
              嶼光咖啡焙煎所嚴選衣索比亞、哥倫比亞與台灣阿里山微批次莊園生豆，以全熱風智能烘焙呈現乾淨花果層次與焦糖甜感。線上即可客製手沖溫度、燕麥奶與熟豆研磨刻度，預約到店免排隊自取或宅配到府。
            </p>
          </div>

          <div className="mt-8 lg:mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F4E3D]"
            >
              <span>立即選購飲品與熟豆</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>

            <button
              type="button"
              onClick={onExploreLocations}
              className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] text-sm font-medium text-zinc-800 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-800"
            >
              <MapPin className="w-4 h-4 text-[#1F4E3D] shrink-0" />
              <span>探索門市地理位置</span>
            </button>
          </div>
        </div>

        {/* Right Full-Height Studio Photography Column */}
        <div className="lg:col-span-6">
          <div className="w-full h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] rounded-xl overflow-hidden border border-zinc-200/80 bg-[#F2EFE9]">
            <SafeImage
              src={HERO_IMAGE_URL}
              alt="嶼光咖啡焙煎所手沖吧台與自然採光空間"
              fallbackLabel="嶼光咖啡焙煎所 · 職人手沖吧台"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Full-Width 4-Column Craft & Fulfillment Proof Strip Below Split */}
      <div className="mt-12 pt-8 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        <div>
          <p className="text-xs font-mono text-zinc-500 tabular-nums mb-1">
            01 · 鮮烘時效保證
          </p>
          <p className="text-sm font-semibold text-zinc-900">
            出貨前 48 小時內小鍋鮮烘
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            每袋標註烘焙日期與批次曲線，鎖住完整揮發性花果芳香。
          </p>
        </div>

        <div>
          <p className="text-xs font-mono text-zinc-500 tabular-nums mb-1">
            02 · 線上預訂快取
          </p>
          <p className="text-sm font-semibold text-zinc-900">
            最快 15 分鐘到店免排隊取餐
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            自由客製手沖冰熱、Oatly 燕麥奶與自備環保杯現折 NT$5。
          </p>
        </div>

        <div>
          <p className="text-xs font-mono text-zinc-500 tabular-nums mb-1">
            03 · 產地溯源標準
          </p>
          <p className="text-sm font-semibold text-zinc-900">
            杯測 87.5 分以上微批次莊園豆
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            公開海拔、處理廠與建議沖煮參數，在家也能重現吧台風味。
          </p>
        </div>

        <div>
          <p className="text-xs font-mono text-zinc-500 tabular-nums mb-1">
            04 · 配送免運禮遇
          </p>
          <p className="text-sm font-semibold text-zinc-900">
            單筆滿 NT$800 享全台免運費
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-600">
            支援門市自取、雙北即時外送與全台熟豆貨到付款或刷卡。
          </p>
        </div>
      </div>
    </section>
  );
};
