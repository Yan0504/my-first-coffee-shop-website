import React from 'react';
import { Clock, RotateCcw, X } from 'lucide-react';
import { FulfillmentMethod, PlacedOrder } from '../types/coffee';

interface OrderHistoryModalProps {
  isOpen: boolean;
  orders: PlacedOrder[];
  onClose: () => void;
  onReorder: (order: PlacedOrder) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  orders,
  onClose,
  onReorder,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="線上訂單查詢與歷史紀錄"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FAF9F7] border border-zinc-200 rounded-2xl shadow-xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#1F4E3D]" />
            <h2 className="font-display text-xl font-semibold text-zinc-900">
              訂單查詢與訂購紀錄
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉訂單紀錄視窗"
            className="p-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="py-16 text-center bg-white border border-zinc-200 rounded-xl px-6">
              <p className="text-base font-semibold text-zinc-900">
                尚無歷史線上訂單紀錄
              </p>
              <p className="mt-1.5 text-sm text-zinc-600">
                您於本裝置送出的現沖飲品自取或莊園熟豆宅配訂單，皆會自動保留於此供即時查閱。
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <article
                key={order.orderNumber}
                className="bg-white border border-zinc-200 rounded-xl p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div>
                    <p className="font-mono text-xs text-zinc-500 tabular-nums">
                      #{order.orderNumber} · {order.createdAt}
                    </p>
                    <p className="text-sm font-semibold text-[#1F4E3D] mt-0.5">
                      {order.status}
                    </p>
                  </div>
                  <span className="font-mono text-base font-semibold text-zinc-900 tabular-nums">
                    NT${order.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-zinc-600 space-y-1">
                  <p>
                    訂購人：{order.customerName}（{order.customerPhone}） ·{' '}
                    {order.paymentMethod}
                  </p>
                  {order.fulfillment === FulfillmentMethod.PICKUP ? (
                    <p>
                      取餐據點：{order.pickupStoreName} · {order.pickupWindow}
                    </p>
                  ) : (
                    <p>
                      配送地址：({order.postalCode}) {order.deliveryAddress}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                  {order.items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="flex justify-between gap-3 text-xs sm:text-sm"
                    >
                      <span className="text-zinc-800">
                        {item.product.name} × {item.quantity}
                        <span className="text-zinc-500 text-xs block">
                          {Object.values(item.customizations)
                            .map((c) => c.label)
                            .join(' · ')}
                        </span>
                      </span>
                      <span className="font-mono text-zinc-700 tabular-nums shrink-0">
                        NT${(item.unitFinalPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onReorder(order);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[38px] text-xs font-medium text-zinc-800 bg-[#FAF9F7] hover:bg-zinc-200/70 border border-zinc-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>再次加入相同品項</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
