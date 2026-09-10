import { useState, useCallback, memo } from 'react';
import {
  ShieldCheck,
  QrCode,
  Banknote,
  CreditCard,
  Check,
  Sparkles,
  ArrowLeft,
  Wrench,
  RotateCcw
} from 'lucide-react';
import {
  EXTENDED_PAYMENT_METHODS,
  PAYMENT_GUIDANCE,
  PAYMENT_CTA_LABELS,
  BRAND_STYLES
} from './orderConstants';
import PaymentMaintenancePopover from './PaymentMaintenancePopover';
import PaymentSummaryHeader from './PaymentSummaryHeader';
import PaymentPrimaryOptionCard from './PaymentPrimaryOptionCard';
import OrderLockoutBanner from './OrderLockoutBanner';

const EXTENDED_ARROW_POSITIONS = [
  'left-[8%] sm:left-[10%]',
  'left-[28%] sm:left-[30%]',
  'left-[48%] sm:left-[50%]',
  'left-[68%] sm:left-[70%]',
  'left-[88%] sm:left-[90%]'
];

function OrderStep2Payment({
  formData,
  selectedTable,
  handleBackToStep1,
  paymentNotice,
  paymentError,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  isMoreMethodsOpen,
  setIsMoreMethodsOpen,
  handleConfirmOrder,
  isProcessingPayment,
  calculatedAmount,
  direction,
  isMaintenance,
  isDisabled,
  getMaintenanceMessage,
  isOrderLocked,
  lockoutReason,
  handleResetLockout
}) {
  const [maintenancePopover, setMaintenancePopover] = useState(null);

  const handleShowMaintenancePopover = useCallback((methodId, name, fallbackMsg, targetType, arrowPosition) => {
    const msg = (typeof getMaintenanceMessage === 'function' ? getMaintenanceMessage(methodId) : '') || fallbackMsg;
    setMaintenancePopover({
      id: methodId,
      name: name,
      message: msg,
      targetType: targetType || methodId,
      arrowPosition: arrowPosition || 'left-8 sm:left-12'
    });
  }, [getMaintenanceMessage]);

  const handleCloseMaintenancePopover = useCallback(() => {
    setMaintenancePopover(null);
  }, []);

  // [URBAN & RAVEN - Cách 1]: Ẩn hoàn toàn các cổng bị Tắt (DISABLED)
  const visibleExtendedMethods = EXTENDED_PAYMENT_METHODS.filter(
    (method) => !(typeof isDisabled === 'function' && isDisabled(method.id))
  );

  const isExtendedSelected = visibleExtendedMethods.some(
    (method) => method.id === selectedPaymentMethod
  );

  const isCurrentMaintenance = typeof isMaintenance === 'function' && isMaintenance(selectedPaymentMethod);
  const currentMaintenanceMsg = typeof getMaintenanceMessage === 'function' ? getMaintenanceMessage(selectedPaymentMethod) : '';
  const isVietQrMaint = typeof isMaintenance === 'function' && isMaintenance('VIETQR');
  const isPostPaidMaint = typeof isMaintenance === 'function' && isMaintenance('POST_PAID_AT_STORE');
  const isCodMaint = typeof isMaintenance === 'function' && isMaintenance('COD');

  const isVietQrDisabled = typeof isDisabled === 'function' && isDisabled('VIETQR');
  const isPostPaidDisabled = typeof isDisabled === 'function' && isDisabled('POST_PAID_AT_STORE');
  const isCodDisabled = typeof isDisabled === 'function' && isDisabled('COD');

  return (
    <div className={`space-y-2.5 sm:space-y-3.5 pb-20 sm:pb-0 ${direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}`}>
      {/* Quick Summary Bar & Payment Notices */}
      <PaymentSummaryHeader
        formData={formData}
        selectedTable={selectedTable}
        handleBackToStep1={handleBackToStep1}
        paymentNotice={paymentNotice}
        paymentError={paymentError}
      />

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-bold text-stone-200">
            Chọn phương thức thanh toán & xác nhận:
          </label>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bảo mật 256-bit SSL</span>
          </span>
        </div>

        {/* 2 Main Recommended Payment Options */}
        {formData.orderType === 'dine-in' ? (
          <div className="space-y-2">
            {!isVietQrDisabled && (
              <PaymentPrimaryOptionCard
                title="Quét mã VietQR Napas 247"
                description="Quét mã qua app ngân hàng bất kỳ. Quán chuẩn bị sẵn bàn đẹp kèm ưu tiên tặng quẩy nóng giòn & trà sen."
                maintDescription="Cổng thanh toán đang bảo trì nâng cấp đường truyền. Quý khách chạm để xem thông tin chi tiết."
                tagText="Khuyên Dùng • Tặng Quẩy"
                tagType="gold"
                icon={QrCode}
                iconColor="text-amber-400"
                methodKey="VIETQR"
                isSelected={selectedPaymentMethod === 'VIETQR'}
                isMaintenance={isVietQrMaint}
                onClick={() => {
                  if (isVietQrMaint) {
                    handleShowMaintenancePopover(
                      'VIETQR',
                      'VietQR Napas 247',
                      'Cổng thanh toán VietQR đang bảo trì nâng cấp đường truyền. Quý khách vui lòng chọn phương thức khác.',
                      'dinein_vietqr',
                      'left-8 sm:left-12'
                    );
                  } else {
                    setSelectedPaymentMethod('VIETQR');
                    setMaintenancePopover(null);
                  }
                }}
                popoverNode={maintenancePopover?.targetType === 'dinein_vietqr' && (
                  <PaymentMaintenancePopover
                    popoverData={maintenancePopover}
                    onClose={handleCloseMaintenancePopover}
                  />
                )}
              />
            )}

            {!isPostPaidDisabled && (
              <PaymentPrimaryOptionCard
                title="Thanh toán sau tại quán"
                description="Bàn được giữ miễn phí. Quý khách tới quán đọc số điện thoại để nhận bàn và thanh toán tại quầy sau bữa ăn."
                maintDescription="Hình thức giữ bàn thanh toán sau tạm thời đang bảo trì."
                tagText="Giữ bàn 30 phút"
                tagType="emerald"
                icon={Banknote}
                iconColor="text-emerald-400"
                methodKey="POST_PAID_AT_STORE"
                isSelected={selectedPaymentMethod === 'POST_PAID_AT_STORE'}
                isMaintenance={isPostPaidMaint}
                onClick={() => {
                  if (isPostPaidMaint) {
                    handleShowMaintenancePopover(
                      'POST_PAID_AT_STORE',
                      'Thanh toán tại quán',
                      'Hình thức giữ bàn thanh toán sau tạm thời đang bảo trì.',
                      'dinein_postpaid',
                      'left-8 sm:left-12'
                    );
                  } else {
                    setSelectedPaymentMethod('POST_PAID_AT_STORE');
                    setMaintenancePopover(null);
                  }
                }}
                popoverNode={maintenancePopover?.targetType === 'dinein_postpaid' && (
                  <PaymentMaintenancePopover
                    popoverData={maintenancePopover}
                    onClose={handleCloseMaintenancePopover}
                  />
                )}
              />
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {!isCodDisabled && (
              <PaymentPrimaryOptionCard
                title="Tiền mặt khi nhận phở (COD)"
                description="Nhân viên giao bát phở nóng 90°C tới tận nơi. Quý khách kiểm tra bát phở và thanh toán tiền mặt trực tiếp."
                maintDescription="Hình thức tiền mặt khi nhận phở tạm thời đang bảo trì."
                tagText="An tâm 100%"
                tagType="emerald"
                icon={Banknote}
                iconColor="text-emerald-400"
                methodKey="COD"
                isSelected={selectedPaymentMethod === 'COD'}
                isMaintenance={isCodMaint}
                onClick={() => {
                  if (isCodMaint) {
                    handleShowMaintenancePopover(
                      'COD',
                      'Tiền mặt khi nhận phở (COD)',
                      'Hình thức tiền mặt khi nhận phở tạm thời đang bảo trì.',
                      'delivery_cod',
                      'left-8 sm:left-12'
                    );
                  } else {
                    setSelectedPaymentMethod('COD');
                    setMaintenancePopover(null);
                  }
                }}
                popoverNode={maintenancePopover?.targetType === 'delivery_cod' && (
                  <PaymentMaintenancePopover
                    popoverData={maintenancePopover}
                    onClose={handleCloseMaintenancePopover}
                  />
                )}
              />
            )}

            {!isVietQrDisabled && (
              <PaymentPrimaryOptionCard
                title="Chuyển khoản VietQR tiện lợi"
                description="Quét mã thanh toán trước nhanh gọn, tài xế có thể treo phở trước cửa nếu bạn bận họp."
                maintDescription="Cổng thanh toán VietQR đang bảo trì nâng cấp đường truyền."
                tagText="Không cần tiền lẻ"
                tagType="emerald"
                icon={QrCode}
                iconColor="text-amber-400"
                methodKey="VIETQR"
                isSelected={selectedPaymentMethod === 'VIETQR'}
                isMaintenance={isVietQrMaint}
                onClick={() => {
                  if (isVietQrMaint) {
                    handleShowMaintenancePopover(
                      'VIETQR',
                      'VietQR Napas 247',
                      'Cổng thanh toán VietQR đang bảo trì nâng cấp đường truyền.',
                      'delivery_vietqr',
                      'left-8 sm:left-12'
                    );
                  } else {
                    setSelectedPaymentMethod('VIETQR');
                    setMaintenancePopover(null);
                  }
                }}
                popoverNode={maintenancePopover?.targetType === 'delivery_vietqr' && (
                  <PaymentMaintenancePopover
                    popoverData={maintenancePopover}
                    onClose={handleCloseMaintenancePopover}
                  />
                )}
              />
            )}
          </div>
        )}

        {/* Extended Payment Methods: Mini-Pills with Brand Accent Glow (Proposal #3) */}
        {visibleExtendedMethods.length > 0 && (
          <div className="pt-2 sm:pt-2.5">
            <div className="flex items-center justify-between mb-1.5 px-0.5">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Ví điện tử & Thẻ quốc tế
              </span>
              {isExtendedSelected ? (
                <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 animate-fadeIn">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Đã kích hoạt</span>
                </span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/15 text-stone-200 font-medium">
                  Chạm để chọn
                </span>
              )}
            </div>

            <div
              className="grid gap-1.5 sm:gap-2"
              style={{
                gridTemplateColumns: `repeat(${Math.min(visibleExtendedMethods.length, 5)}, minmax(0, 1fr))`
              }}
            >
              {visibleExtendedMethods.map((method, index) => {
                const isSelected = selectedPaymentMethod === method.id;
                const isMethodMaint = typeof isMaintenance === 'function' && isMaintenance(method.id);
                const brandStyle = BRAND_STYLES[method.id] || {
                  activeBorder: 'border-amber-400',
                  activeBg: 'bg-amber-500/15',
                  activeGlow: 'shadow-[0_0_14px_rgba(251,191,36,0.4)] ring-1 ring-amber-400',
                  activeText: 'text-amber-300',
                  badgeBg: 'bg-white/10 text-stone-200 border-white/20'
                };

                const arrowPercent = Math.round(((index + 0.5) / visibleExtendedMethods.length) * 100);

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      if (isMethodMaint) {
                        handleShowMaintenancePopover(
                          method.id,
                          method.shortName || method.name,
                          'Cổng thanh toán này đang bảo trì nâng cấp đường truyền.',
                          'extended',
                          `left-[${arrowPercent}%]`
                        );
                      } else {
                        setSelectedPaymentMethod(method.id);
                        setMaintenancePopover(null);
                      }
                    }}
                    aria-pressed={isSelected}
                    className={`relative py-1.5 px-1 sm:py-2.5 sm:px-2 rounded-xl border text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 active:scale-95 group ${
                      isMethodMaint ? 'opacity-70 grayscale-[25%] border-dashed border-amber-400/60 bg-amber-950/20' : ''
                    } ${
                      isSelected
                        ? `${brandStyle.activeBorder} ${brandStyle.activeBg} ${brandStyle.activeGlow}`
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    {/* High-Contrast Maintenance Indicator Pip */}
                    {isMethodMaint && (
                      <div className="absolute -top-1.5 -left-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[8px] font-black tracking-tight flex items-center gap-0.5 shadow-md border border-amber-200">
                        <Wrench className="w-2.5 h-2.5" />
                        <span className="hidden sm:inline">BẢO TRÌ</span>
                      </div>
                    )}

                    {/* Brand Badge Icon */}
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        isSelected ? brandStyle.badgeBg : method.badgeBg
                      }`}
                    >
                      {method.isCard ? (
                        <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-black tracking-tight">{method.badge}</span>
                      )}
                    </div>

                    {/* Short Name */}
                    <span
                      className={`text-[10px] sm:text-xs font-bold leading-tight truncate w-full transition-colors ${
                        isSelected ? brandStyle.activeText : 'text-stone-300 group-hover:text-white'
                      }`}
                    >
                      {method.shortName || method.badge || method.name}
                    </span>

                    {/* Active Indicator Pip */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bảng Thông Báo Popover Di Sản Nhỏ Gọn Khi Chạm Vào Cổng Bảo Trì (Phương Án B) */}
            {maintenancePopover?.targetType === 'extended' && (
              <PaymentMaintenancePopover
                popoverData={maintenancePopover}
                onClose={handleCloseMaintenancePopover}
              />
            )}

            {/* Dynamic Micro-Guidance Banner */}
            {isExtendedSelected && !isCurrentMaintenance && (
              <div className={`mt-1.5 p-2 sm:p-2.5 rounded-xl border text-[11px] sm:text-xs flex items-center gap-2 animate-fadeIn ${
                BRAND_STYLES[selectedPaymentMethod]?.bannerStyle || 'bg-amber-500/10 border-amber-500/20 text-amber-200'
              }`}>
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span className="leading-snug">
                  {PAYMENT_GUIDANCE[selectedPaymentMethod]}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* [URBAN & RAVEN] Banner Niêm Phong Đặt Bàn khi SĐT hoặc tài khoản bị khóa */}
      {isOrderLocked && (
        <OrderLockoutBanner
          reason={lockoutReason}
          onChangePhone={handleResetLockout}
        />
      )}

      {/* Action Buttons for Step 2 (Unified Responsive Inline with Mobile Safe-Zone Clearance) */}
      <div className="pt-2 pb-20 sm:pb-0 flex items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={handleBackToStep1}
          className="py-3 sm:py-3.5 px-3.5 sm:px-5 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-stone-300 font-semibold text-xs sm:text-sm transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay Lại</span>
        </button>
        {isOrderLocked ? (
          <button
            type="button"
            onClick={handleResetLockout}
            className="flex-1 min-w-0 py-3 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-700 via-amber-600 to-red-800 text-amber-100 cursor-pointer border border-amber-400/40 hover:brightness-110"
          >
            <RotateCcw className="w-4 h-4 text-amber-200" />
            <span className="truncate">SỐ ĐÃ BỊ KHÓA • BẤM ĐỂ ĐỔI SỐ KHÁC</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={isProcessingPayment || isCurrentMaintenance}
            className={`flex-1 min-w-0 py-3 sm:py-3.5 px-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-1.5 ${
              isCurrentMaintenance
                ? 'bg-zinc-800 text-amber-300 border-2 border-amber-400 cursor-not-allowed shadow-inner'
                : 'bg-gradient-to-r from-brand-red to-amber-600 hover:from-brand-redhover hover:to-amber-700 active:scale-98 text-white cursor-pointer disabled:opacity-50'
            }`}
          >
            {isProcessingPayment ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Đang Xác Nhận...</span>
              </span>
            ) : isCurrentMaintenance ? (
              <span className="flex items-center gap-1.5 font-black truncate text-amber-300">
                <Wrench className="w-4 h-4 text-amber-400 animate-pulse" />
                Cổng Đang Bảo Trì — Vui Lòng Đổi Cổng Khác
              </span>
            ) : (
              <span className="truncate">
                {PAYMENT_CTA_LABELS[selectedPaymentMethod] || 'Xác Nhận Giữ Chỗ Ngay →'}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default memo(OrderStep2Payment);

