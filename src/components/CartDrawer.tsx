import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  Store,
  X,
} from 'lucide-react';
import {
  CartItem,
  FulfillmentMethod,
  LiveStorePlace,
  PaymentMethod,
  PlacedOrder,
  ProductCategory,
} from '../types/coffee';
import { SafeImage } from './SafeImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  availableStores: LiveStorePlace[];
  selectedStore: LiveStorePlace | null;
  onSelectStore: (store: LiveStorePlace) => void;
  onClose: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onPlaceOrder: (order: PlacedOrder) => void;
}

const FREE_SHIPPING_THRESHOLD = 800;
const STANDARD_SHIPPING_FEE = 80;
const ECO_CUP_DISCOUNT_PER_DRINK = 5;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  availableStores,
  selectedStore,
  onSelectStore,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
}) => {
  const [fulfillment, setFulfillment] = useState<FulfillmentMethod>(
    FulfillmentMethod.PICKUP
  );
  const [pickupWindow, setPickupWindow] = useState('立即製作（約 15 分鐘後可取餐）');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.PAY_AT_PICKUP
  );
  const [useEcoCup, setUseEcoCup] = useState(false);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<PlacedOrder | null>(null);

  const freshDrinkCount = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          item.product.category === ProductCategory.FRESH_DRINK
            ? sum + item.quantity
            : sum,
        0
      ),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitFinalPrice * item.quantity, 0),
    [items]
  );

  const ecoCupCount =
    fulfillment === FulfillmentMethod.PICKUP && useEcoCup ? freshDrinkCount : 0;
  const ecoDiscount = ecoCupCount * ECO_CUP_DISCOUNT_PER_DRINK;

  const shippingFee = useMemo(() => {
    if (fulfillment === FulfillmentMethod.PICKUP || subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  }, [fulfillment, subtotal]);

  const totalAmount = Math.max(0, subtotal - ecoDiscount + shippingFee);

  const handleFulfillmentChange = (mode: FulfillmentMethod) => {
    setFulfillment(mode);
    setFormError(null);
    if (mode === FulfillmentMethod.PICKUP) {
      setPaymentMethod(PaymentMethod.PAY_AT_PICKUP);
    } else {
      setPaymentMethod(PaymentMethod.COD);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!customerName.trim()) {
      setFormError('請填寫訂購人姓名，以便核對取餐或收件資訊。');
      return;
    }
    const cleanedPhone = customerPhone.replace(/[\s-]/g, '');
    if (!/^09\d{8}$/.test(cleanedPhone) && cleanedPhone.length < 8) {
      setFormError('請輸入有效的聯絡電話（例如：0912-345-678）。');
      return;
    }
    if (fulfillment === FulfillmentMethod.DELIVERY) {
      if (!deliveryAddress.trim() || deliveryAddress.trim().length < 6) {
        setFormError('請填寫完整外送或宅配收件地址。');
        return;
      }
      if (!postalCode.trim()) {
        setFormError('請填寫 3 碼或 5 碼郵遞區號。');
        return;
      }
    }

    setFormError(null);
    const activePickupStore = selectedStore || availableStores[0] || null;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    const newOrder: PlacedOrder = {
      orderNumber: `LM-${dateStamp}-${randomSuffix}`,
      createdAt: new Date().toLocaleString('zh-TW', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      fulfillment,
      pickupStoreName:
        fulfillment === FulfillmentMethod.PICKUP
          ? activePickupStore?.name || '嶼光咖啡 台北概念取餐吧台'
          : undefined,
      pickupStoreAddress:
        fulfillment === FulfillmentMethod.PICKUP
          ? activePickupStore?.address || '請見門市地圖定位資訊'
          : undefined,
      pickupWindow:
        fulfillment === FulfillmentMethod.PICKUP ? pickupWindow : undefined,
      deliveryAddress:
        fulfillment === FulfillmentMethod.DELIVERY
          ? deliveryAddress.trim()
          : undefined,
      postalCode:
        fulfillment === FulfillmentMethod.DELIVERY ? postalCode.trim() : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      paymentMethod,
      ecoCupCount,
      ecoDiscount,
      subtotal,
      shippingFee,
      totalAmount,
      note: note.trim() || undefined,
      items: [...items],
      status: '已成立訂單 · 準備磨豆萃取',
    };

    onPlaceOrder(newOrder);
    setConfirmedOrder(newOrder);
  };

  const handleCloseDrawer = () => {
    setConfirmedOrder(null);
    setFormError(null);
    onClose();
  };

  if (!isOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="線上訂購購物袋"
      onClick={handleCloseDrawer}
    >
      <div
        className="w-full max-w-lg bg-[#FAF9F7] h-full shadow-2xl border-l border-zinc-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#1F4E3D]" />
            <h2 className="font-display text-xl font-semibold text-zinc-900">
              {confirmedOrder ? '訂單成立確認明細' : '線上訂購清單'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="關閉訂購視窗"
            className="p-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {confirmedOrder ? (
            /* Post-Order Verification & Receipt View */
            <div className="space-y-6">
              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#1F4E3D] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-mono text-xs text-zinc-500 tabular-nums">
                      訂單編號 #{confirmedOrder.orderNumber} · {confirmedOrder.createdAt}
                    </p>
                    <h3 className="text-lg font-semibold text-zinc-900 mt-1">
                      {confirmedOrder.status}
                    </h3>
                    <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
                      感謝您的訂購，{confirmedOrder.customerName}。吧台與烘焙室已同步收到您的客製規格。
                    </p>
                  </div>
                </div>

                <dl className="mt-5 pt-5 border-t border-zinc-200 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500 shrink-0">取貨方式</dt>
                    <dd className="text-zinc-900 font-medium text-right">
                      {confirmedOrder.fulfillment === FulfillmentMethod.PICKUP
                        ? '門市免排隊自取'
                        : '專人外送 / 熟豆宅配'}
                    </dd>
                  </div>

                  {confirmedOrder.fulfillment === FulfillmentMethod.PICKUP ? (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt className="text-zinc-500 shrink-0">取餐據點</dt>
                        <dd className="text-zinc-900 font-medium text-right">
                          {confirmedOrder.pickupStoreName}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-zinc-500 shrink-0">預計取餐</dt>
                        <dd className="text-zinc-900 text-right">
                          {confirmedOrder.pickupWindow}
                        </dd>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500 shrink-0">收件地址</dt>
                      <dd className="text-zinc-900 text-right">
                        ({confirmedOrder.postalCode}) {confirmedOrder.deliveryAddress}
                      </dd>
                    </div>
                  )}

                  <div className="flex justify-between gap-4">
                    <dt className="text-zinc-500 shrink-0">付款條件</dt>
                    <dd className="text-zinc-900 text-right">
                      {confirmedOrder.paymentMethod}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Receipt Item Summary */}
              <div className="bg-white border border-zinc-200 rounded-xl p-5">
                <h4 className="text-xs font-semibold text-zinc-900 mb-3">
                  訂購品項明細
                </h4>
                <div className="divide-y divide-zinc-100">
                  {confirmedOrder.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="py-3 flex items-start justify-between gap-4 text-xs sm:text-sm"
                    >
                      <div>
                        <p className="font-medium text-zinc-900">
                          {item.product.name} × {item.quantity}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {Object.values(item.customizations)
                            .map((c) => c.label)
                            .join(' · ')}
                        </p>
                      </div>
                      <span className="font-mono text-zinc-900 tabular-nums shrink-0">
                        NT${(item.unitFinalPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-200 space-y-1.5 text-xs sm:text-sm tabular-nums">
                  <div className="flex justify-between text-zinc-600">
                    <span>商品小計</span>
                    <span className="font-mono">
                      NT${confirmedOrder.subtotal.toLocaleString()}
                    </span>
                  </div>
                  {confirmedOrder.ecoDiscount > 0 && (
                    <div className="flex justify-between text-[#1F4E3D]">
                      <span>自備環保杯折抵 ({confirmedOrder.ecoCupCount} 杯)</span>
                      <span className="font-mono">-NT${confirmedOrder.ecoDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600">
                    <span>運費</span>
                    <span className="font-mono">
                      {confirmedOrder.shippingFee === 0
                        ? '免運費 NT$0'
                        : `NT$${confirmedOrder.shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-semibold text-zinc-900 pt-2 border-t border-zinc-200">
                    <span>實付總額</span>
                    <span className="font-mono">
                      NT${confirmedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseDrawer}
                className="w-full py-3 min-h-[44px] text-sm font-semibold text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors cursor-pointer"
              >
                完成並返回門市首頁
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart State */
            <div className="py-20 text-center">
              <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-3 stroke-[1.5]" />
              <p className="text-base font-semibold text-zinc-900">
                您的線上訂購清單目前為空
              </p>
              <p className="mt-1.5 text-sm text-zinc-600 max-w-xs mx-auto">
                可由豆單挑選當日手沖飲品、琥珀拿鐵或微批次莊園咖啡熟豆加入訂購。
              </p>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="mt-6 px-5 py-2.5 min-h-[42px] text-sm font-medium text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors cursor-pointer"
              >
                瀏覽嚴選咖啡豆單
              </button>
            </div>
          ) : (
            /* Active Cart Items + Fulfillment & Checkout Form */
            <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Fulfillment Mode Selector */}
              <div
                role="group"
                aria-label="取貨方式選擇"
                className="grid grid-cols-2 gap-2 p-1 bg-[#EAE8E3] rounded-xl"
              >
                <button
                  type="button"
                  onClick={() => handleFulfillmentChange(FulfillmentMethod.PICKUP)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 min-h-[42px] rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    fulfillment === FulfillmentMethod.PICKUP
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Store className="w-4 h-4 text-[#1F4E3D] shrink-0" />
                  <span>門市免排隊自取</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFulfillmentChange(FulfillmentMethod.DELIVERY)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 min-h-[42px] rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    fulfillment === FulfillmentMethod.DELIVERY
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Truck className="w-4 h-4 text-[#1F4E3D] shrink-0" />
                  <span>外送 / 熟豆宅配</span>
                </button>
              </div>

              {/* Delivery Free Shipping Threshold Indicator */}
              {fulfillment === FulfillmentMethod.DELIVERY && (
                <div className="bg-white border border-zinc-200 rounded-xl px-4 py-3 text-xs text-zinc-700 tabular-nums">
                  {remainingForFreeShipping > 0 ? (
                    <p>
                      再選購{' '}
                      <span className="font-mono font-semibold text-[#1F4E3D]">
                        NT${remainingForFreeShipping.toLocaleString()}
                      </span>{' '}
                      即可享滿 NT$800 免運優惠（目前運費 NT$80）。
                    </p>
                  ) : (
                    <p className="text-[#1F4E3D] font-medium">
                      已達單筆滿 NT$800 免運門檻，本單享免運費配送。
                    </p>
                  )}
                </div>
              )}

              {/* Itemized List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="bg-white border border-zinc-200 rounded-xl p-3.5 flex gap-3.5"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#ECE9E2] shrink-0">
                      <SafeImage
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-zinc-900 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartItemId)}
                          aria-label={`移除 ${item.product.name}`}
                          className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                        {Object.values(item.customizations)
                          .map((c) => c.label)
                          .join(' · ')}
                      </p>

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="inline-flex items-center border border-zinc-200 rounded-md bg-[#FAF9F7]">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                            aria-label="減少數量"
                            className="px-2 py-1 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 font-mono text-xs font-medium text-zinc-900 tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                            aria-label="增加數量"
                            className="px-2 py-1 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="font-mono text-sm font-medium text-zinc-900 tabular-nums">
                          NT${(item.unitFinalPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Eco-Cup Option for Pickup */}
              {fulfillment === FulfillmentMethod.PICKUP && freshDrinkCount > 0 && (
                <label className="flex items-center justify-between gap-3 bg-white border border-zinc-200 rounded-xl px-4 py-3 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={useEcoCup}
                      onChange={(e) => setUseEcoCup(e.target.checked)}
                      className="w-4 h-4 accent-[#1F4E3D] rounded"
                    />
                    <span className="text-xs sm:text-sm text-zinc-800 font-medium">
                      自備環保隨行杯取餐（現萃飲品每杯現折 NT$5）
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#1F4E3D] font-medium tabular-nums whitespace-nowrap">
                    -NT${freshDrinkCount * ECO_CUP_DISCOUNT_PER_DRINK}
                  </span>
                </label>
              )}

              {/* Customer & Fulfillment Verification Fields */}
              <div className="bg-white border border-zinc-200 rounded-xl p-4 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-900">
                  訂購人與取件資訊核對
                </h3>

                {fulfillment === FulfillmentMethod.PICKUP ? (
                  <>
                    {availableStores.length > 0 && (
                      <div>
                        <label
                          htmlFor="pickup-store-select"
                          className="block text-xs text-zinc-600 mb-1"
                        >
                          選擇取餐門市據點（同步自 Google Maps 門市清單）
                        </label>
                        <select
                          id="pickup-store-select"
                          value={selectedStore?.id || availableStores[0]?.id || ''}
                          onChange={(e) => {
                            const found = availableStores.find(
                              (s) => s.id === e.target.value
                            );
                            if (found) onSelectStore(found);
                          }}
                          className="w-full px-3 py-2.5 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#1F4E3D]"
                        >
                          {availableStores.map((store) => (
                            <option key={store.id} value={store.id}>
                              {store.name} — {store.address}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="pickup-window-select"
                        className="block text-xs text-zinc-600 mb-1"
                      >
                        預計到店取餐時段
                      </label>
                      <select
                        id="pickup-window-select"
                        value={pickupWindow}
                        onChange={(e) => setPickupWindow(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#1F4E3D]"
                      >
                        <option value="立即製作（約 15 分鐘後可取餐）">
                          立即製作（約 15 分鐘後可取餐）
                        </option>
                        <option value="30 分鐘後到店取餐">30 分鐘後到店取餐</option>
                        <option value="1 小時後到店取餐">1 小時後到店取餐</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label
                        htmlFor="postal-code"
                        className="block text-xs text-zinc-600 mb-1"
                      >
                        郵遞區號 *
                      </label>
                      <input
                        id="postal-code"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="106"
                        className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 font-mono tabular-nums focus:outline-none focus:border-[#1F4E3D]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="delivery-address"
                        className="block text-xs text-zinc-600 mb-1"
                      >
                        收件完整地址 *
                      </label>
                      <input
                        id="delivery-address"
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="台北市大安區信義路四段..."
                        className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#1F4E3D]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="customer-name"
                      className="block text-xs text-zinc-600 mb-1"
                    >
                      訂購人姓名 *
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="王小美"
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#1F4E3D]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="customer-phone"
                      className="block text-xs text-zinc-600 mb-1"
                    >
                      聯絡手機 *
                    </label>
                    <input
                      id="customer-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0912-345-678"
                      className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 font-mono tabular-nums focus:outline-none focus:border-[#1F4E3D]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="payment-method"
                    className="block text-xs text-zinc-600 mb-1"
                  >
                    付款方式
                  </label>
                  <select
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2.5 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#1F4E3D]"
                  >
                    {fulfillment === FulfillmentMethod.PICKUP ? (
                      <>
                        <option value={PaymentMethod.PAY_AT_PICKUP}>
                          {PaymentMethod.PAY_AT_PICKUP}
                        </option>
                        <option value={PaymentMethod.LINE_PAY}>
                          {PaymentMethod.LINE_PAY}
                        </option>
                        <option value={PaymentMethod.CREDIT_CARD}>
                          {PaymentMethod.CREDIT_CARD}
                        </option>
                      </>
                    ) : (
                      <>
                        <option value={PaymentMethod.COD}>{PaymentMethod.COD}</option>
                        <option value={PaymentMethod.CREDIT_CARD}>
                          {PaymentMethod.CREDIT_CARD}
                        </option>
                        <option value={PaymentMethod.LINE_PAY}>
                          {PaymentMethod.LINE_PAY}
                        </option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="order-note" className="block text-xs text-zinc-600 mb-1">
                    訂單備註（選填）
                  </label>
                  <input
                    id="order-note"
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="例如：需要統一編號、粉水比偏好或門鈴提醒..."
                    className="w-full px-3 py-2 text-sm bg-[#FAF9F7] border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-[#1F4E3D]"
                  />
                </div>

                {formError && (
                  <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Sticky Drawer Footer Totals & Submit Button */}
        {!confirmedOrder && items.length > 0 && (
          <div className="p-6 bg-white border-t border-zinc-200 shrink-0 space-y-3">
            <div className="space-y-1 text-xs sm:text-sm tabular-nums">
              <div className="flex justify-between text-zinc-600">
                <span>商品小計</span>
                <span className="font-mono">NT${subtotal.toLocaleString()}</span>
              </div>
              {ecoDiscount > 0 && (
                <div className="flex justify-between text-[#1F4E3D]">
                  <span>自備環保杯折抵</span>
                  <span className="font-mono">-NT${ecoDiscount}</span>
                </div>
              )}
              {fulfillment === FulfillmentMethod.DELIVERY && (
                <div className="flex justify-between text-zinc-600">
                  <span>配送運費</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? '免運費 NT$0' : `NT$${shippingFee}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-zinc-900 pt-2 border-t border-zinc-100">
                <span>應付總計</span>
                <span className="font-mono">NT${totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="w-full py-3 min-h-[46px] text-sm font-semibold text-white bg-[#1F4E3D] hover:bg-[#16382C] rounded-lg transition-colors duration-150 whitespace-nowrap cursor-pointer tabular-nums"
            >
              送出訂單 · NT${totalAmount.toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
