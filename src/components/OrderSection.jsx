import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SeatMapModal from './SeatMapModal';
import { BRANCH_LABELS } from './order/orderConstants';
import OrderPrivilegesPanel from './order/OrderPrivilegesPanel';
import OrderStep1Booking from './order/OrderStep1Booking';
import OrderStep2Payment from './order/OrderStep2Payment';
import OrderStep3QrPayment from './order/OrderStep3QrPayment';
import OrderStep3Success from './order/OrderStep3Success';
import { useOrderSectionState } from './order/useOrderSectionState';

function OrderSection() {
  const [sectionRef, isVisible] = useScrollReveal({ threshold: 0.12 });
  const {
    formData,
    step,
    direction,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isMoreMethodsOpen,
    setIsMoreMethodsOpen,
    paymentData,
    bookingCode,
    isCopied,
    isProcessingPayment,
    isVietQrConfirmed,
    setIsVietQrConfirmed,
    isLoading,
    paymentNotice,
    paymentError,
    selectedTable,
    isSeatMapOpen,
    setIsSeatMapOpen,
    todayDateStr,
    calculatedAmount,
    selectedTasteSet,
    handleInputChange,
    handleSetOrderType,
    handleSetGuestCount,
    handleToggleTaste,
    handleCloseSeatMap,
    handleConfirmTable,
    handleSubmit,
    handleConfirmOrder,
    handleBackToStep1,
    handleBackToStep2,
    handleCopyCode,
    handleReset
  } = useOrderSectionState(sectionRef);

  const isQrScreen = (selectedPaymentMethod === 'MOMO' || selectedPaymentMethod === 'VIETQR' || selectedPaymentMethod === 'SEPAY') && !isVietQrConfirmed;
  const shouldShowCard = isVisible || step > 1;

  return (
    <section id="order" ref={sectionRef} className="py-14 sm:py-20 bg-stone-900 text-white relative scroll-mt-20 sm:scroll-mt-24">
      {/* Visual Accent Container (Safely clipped without breaking scroll-margin-top) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Privileges Panel (Mobile & Desktop) */}
          <OrderPrivilegesPanel isVisible={shouldShowCard} />

          {/* Right form card */}
          <div
            id="order-form-card"
            className={`lg:col-span-7 scroll-mt-24 sm:scroll-mt-28 transition-all duration-700 ${shouldShowCard ? 'reveal-slide-right' : 'opacity-0'}`}
          >
            <div className="bg-[#241710] border border-amber-900/40 rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xl relative">
              
              {/* Progress Breadcrumbs (Visible on Step 2 & Step 3) */}
              {step > 1 && (
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10 text-xs px-1 animate-fadeIn">
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="flex items-center gap-1.5 cursor-pointer group"
                    title="Quay lại bước 1"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 group-hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs transition-colors">✓</span>
                    <span className="text-emerald-400 group-hover:text-emerald-300 font-medium transition-colors">1. Thông tin</span>
                  </button>

                  <div className="h-0.5 flex-1 mx-2.5 bg-stone-700/60 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-500 ease-out ${step >= 2 ? 'w-full' : 'w-0'}`} />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs transition-all duration-300 ${step === 2 ? 'bg-brand-red text-white scale-110 ring-2 ring-amber-400/40' : 'bg-emerald-600 text-white'}`}>
                      {step > 2 ? '✓' : '2'}
                    </span>
                    <span className={`transition-colors duration-300 ${step === 2 ? 'text-amber-200 font-bold' : 'text-emerald-400 font-medium'}`}>
                      2. Thanh toán
                    </span>
                  </div>

                  <div className="h-0.5 flex-1 mx-2.5 bg-stone-700/60 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 ease-out ${step >= 3 ? 'w-full' : 'w-0'}`} />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs transition-all duration-300 ${step === 3 ? 'bg-brand-red text-white scale-110 ring-2 ring-amber-400/40' : 'bg-stone-800 text-stone-500'}`}>
                      3
                    </span>
                    <span className={`transition-colors duration-300 ${step === 3 ? 'text-amber-200 font-bold' : 'text-stone-500 font-medium'}`}>
                      3. Hoàn tất
                    </span>
                  </div>
                </div>
              )}

              {/* STEP 1: Interactive Form State */}
              {step === 1 && (
                <OrderStep1Booking
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleSetOrderType={handleSetOrderType}
                  handleSetGuestCount={handleSetGuestCount}
                  todayDateStr={todayDateStr}
                  selectedTable={selectedTable}
                  setIsSeatMapOpen={setIsSeatMapOpen}
                  selectedTasteSet={selectedTasteSet}
                  handleToggleTaste={handleToggleTaste}
                  isLoading={isLoading}
                  handleSubmit={handleSubmit}
                  direction={direction}
                />
              )}

              {/* STEP 2: Payment Method Selection */}
              {step === 2 && (
                <OrderStep2Payment
                  formData={formData}
                  selectedTable={selectedTable}
                  handleBackToStep1={handleBackToStep1}
                  paymentNotice={paymentNotice}
                  paymentError={paymentError}
                  selectedPaymentMethod={selectedPaymentMethod}
                  setSelectedPaymentMethod={setSelectedPaymentMethod}
                  isMoreMethodsOpen={isMoreMethodsOpen}
                  setIsMoreMethodsOpen={setIsMoreMethodsOpen}
                  handleConfirmOrder={handleConfirmOrder}
                  isProcessingPayment={isProcessingPayment}
                  calculatedAmount={calculatedAmount}
                  direction={direction}
                />
              )}

              {/* STEP 3: QR Payment or Heritage Boarding Pass Success */}
              {step === 3 && (
                <div className={`space-y-4 ${direction === 'forward' ? 'animate-step-forward' : 'animate-step-backward'}`}>
                  {isQrScreen ? (
                    <OrderStep3QrPayment
                      selectedPaymentMethod={selectedPaymentMethod}
                      paymentData={paymentData}
                      bookingCode={bookingCode}
                      isCopied={isCopied}
                      handleCopyCode={handleCopyCode}
                      handleBackToStep2={handleBackToStep2}
                      setIsVietQrConfirmed={setIsVietQrConfirmed}
                      submitSePayCheckout={submitSePayCheckout}
                    />
                  ) : (
                    <OrderStep3Success
                      formData={formData}
                      bookingCode={bookingCode}
                      isCopied={isCopied}
                      handleCopyCode={handleCopyCode}
                      selectedPaymentMethod={selectedPaymentMethod}
                      selectedTable={selectedTable}
                      handleReset={handleReset}
                      branchLabels={BRANCH_LABELS}
                    />
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </div>

      {/* SMART SEAT MAP MODAL: PORTAL & ISOLATED RENDER TREE */}
      <SeatMapModal
        isOpen={isSeatMapOpen}
        onClose={handleCloseSeatMap}
        selectedTable={selectedTable}
        onConfirmTable={handleConfirmTable}
        branchLabel={BRANCH_LABELS[formData.branch] || '45 Hàng Bạc, Hoàn Kiếm, Hà Nội'}
        date={formData.date}
        time={formData.time}
        guestCount={formData.guestCount}
      />
    </section>
  );
}

export default React.memo(OrderSection);
