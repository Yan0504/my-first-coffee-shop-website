import React, { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, ShoppingBag, X } from 'lucide-react';
import {
  CoffeeProduct,
  CustomizationChoice,
  SelectedCustomizations,
} from '../types/coffee';
import { SafeImage } from './SafeImage';

interface ProductDetailModalProps {
  product: CoffeeProduct | null;
  onClose: () => void;
  onAddToCart: (
    product: CoffeeProduct,
    customizations: SelectedCustomizations,
    quantity: number
  ) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<SelectedCustomizations>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    const defaults: SelectedCustomizations = {};
    product.customizationGroups.forEach((group) => {
      if (group.choices[0]) {
        defaults[group.id] = group.choices[0];
      }
    });
    setSelectedOptions(defaults);
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  const unitFinalPrice = useMemo(() => {
    if (!product) return 0;
    const extra = Object.values(selectedOptions).reduce(
      (sum, choice) => sum + (choice?.priceDelta || 0),
      0
    );
    return product.basePrice + extra;
  }, [product, selectedOptions]);

  if (!product) return null;

  const handleSelectChoice = (groupId: string, choice: CustomizationChoice) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupId]: choice,
    }));
  };

  const handleConfirmAdd = () => {
    onAddToCart(product, selectedOptions, quantity);
    onClose();
  };

  const renderSensoryBar = (label: string, score: number) => (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-xs font-medium text-zinc-600 whitespace-nowrap">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={`w-5 h-1.5 rounded-xs ${
                step <= score ? 'bg-[#1F4E3D]' : 'bg-zinc-200'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-zinc-700 tabular-nums w-7 text-right">
          {score}/5
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF9F7] border border-zinc-200 rounded-2xl shadow-xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Close Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 shrink-0">
          <div className="text-xs text-zinc-500">
            <span>品項編號 {product.code}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{product.roastLevel}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{product.statusNote}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="關閉產品視窗"
            className="p-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Two-Column Contiguous PDP Body */}
        <div className="overflow-y-auto p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Studio Image + Origin Specs + Brewing Recipe */}
          <div className="lg:col-span-6 space-y-6">
            <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#ECE9E2] border border-zinc-200/80">
              <SafeImage
                src={product.imageUrl}
                alt={product.name}
                fallbackLabel={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Sensory Profile */}
            <div className="bg-white rounded-xl border border-zinc-200/90 p-5">
              <h4 className="text-xs font-semibold text-zinc-900 mb-3">
                感官杯測結構與產區履歷
              </h4>
              <div className="divide-y divide-zinc-100">
                {renderSensoryBar('果酸明亮感 Acidity', product.sensory.acidity)}
                {renderSensoryBar('焦糖甜感 Sweetness', product.sensory.sweetness)}
                {renderSensoryBar('脂感醇厚度 Body', product.sensory.body)}
              </div>

              <dl className="mt-4 pt-4 border-t border-zinc-200 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                <div>
                  <dt className="text-zinc-500">莊園產區</dt>
                  <dd className="text-zinc-900 font-medium mt-0.5">{product.origin}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">種植海拔</dt>
                  <dd className="font-mono text-zinc-900 mt-0.5 tabular-nums">
                    {product.altitude}
                  </dd>
                </div>
                <div>
                  <dt className="text-zinc-500">生豆處理法</dt>
                  <dd className="text-zinc-900 font-medium mt-0.5">{product.process}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">咖啡品種</dt>
                  <dd className="text-zinc-900 font-medium mt-0.5">{product.varietal}</dd>
                </div>
              </dl>
            </div>

            {/* Barista Brewing Parameters */}
            <div className="bg-white rounded-xl border border-zinc-200/90 p-5">
              <h4 className="text-xs font-semibold text-zinc-900 mb-2.5">
                吧台首席沖煮與萃取建議
              </h4>
              <div className="space-y-1.5 text-xs text-zinc-600">
                <p>
                  <span className="text-zinc-500">萃取方式：</span>
                  <span className="text-zinc-800 font-medium">
                    {product.brewingRecipe.method}
                  </span>
                </p>
                <p className="tabular-nums">
                  <span className="text-zinc-500">建議比例：</span>
                  <span>{product.brewingRecipe.ratio}</span>
                </p>
                <p className="tabular-nums">
                  <span className="text-zinc-500">水溫與時間：</span>
                  <span>
                    {product.brewingRecipe.waterTemp} · {product.brewingRecipe.brewTime}
                  </span>
                </p>
                <p>
                  <span className="text-zinc-500">研磨建議：</span>
                  <span>{product.brewingRecipe.grindNote}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Contiguous Purchase & Customization Module */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <p className="text-xs text-zinc-500">{product.englishSubtitle}</p>
              <h3
                id="pdp-modal-title"
                className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900 mt-1"
              >
                {product.name}
              </h3>

              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-mono text-2xl font-semibold text-[#1F4E3D] tabular-nums">
                  NT${unitFinalPrice.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-500">{product.unitLabel}</span>
              </div>

              <p className="mt-3 text-xs text-zinc-600">
                風味調性：{product.flavorNotes.join(' · ')}
              </p>

              <p className="mt-4 text-sm text-zinc-600 leading-relaxed">
                {product.story}
              </p>

              {/* Customization Groups */}
              <div className="mt-6 pt-6 border-t border-zinc-200 space-y-5">
                {product.customizationGroups.map((group) => (
                  <fieldset key={group.id}>
                    <legend className="text-xs font-semibold text-zinc-900 mb-2.5">
                      {group.name}
                      {group.required && (
                        <span className="ml-1.5 font-normal text-zinc-500">
                          · 必選項目
                        </span>
                      )}
                    </legend>
                    <div className="space-y-2">
                      {group.choices.map((choice) => {
                        const isSelected =
                          selectedOptions[group.id]?.id === choice.id;
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => handleSelectChoice(group.id, choice)}
                            className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 min-h-[42px] rounded-lg border text-left text-xs sm:text-sm transition-colors duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-white border-[#1F4E3D] text-zinc-900 font-medium ring-1 ring-[#1F4E3D]'
                                : 'bg-white/70 border-zinc-200 text-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <span>{choice.label}</span>
                            <span className="font-mono text-xs text-zinc-600 tabular-nums whitespace-nowrap shrink-0">
                              {choice.priceDelta > 0
                                ? `+NT$${choice.priceDelta}`
                                : '標準配置'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            </div>

            {/* Quantity Stepper & Primary Add to Cart CTA */}
            <div className="mt-8 pt-5 border-t border-zinc-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="inline-flex items-center justify-between bg-white border border-zinc-300 rounded-lg px-2 min-h-[46px] sm:w-36 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="減少數量"
                  className="p-2 text-zinc-600 hover:text-zinc-900 disabled:opacity-40 cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-mono text-sm font-semibold text-zinc-900 tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  aria-label="增加數量"
                  className="p-2 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmAdd}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] text-sm font-semibold text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer tabular-nums"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>
                  加入訂購清單 · NT${(unitFinalPrice * quantity).toLocaleString()}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
