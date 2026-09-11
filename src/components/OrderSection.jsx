import React from 'react';
import useScrollReveal from '../hooks/useScrollReveal';
import SeatMapModal from './SeatMapModal';
import { BRANCH_LABELS } from './order/orderConstants';
import OrderPrivilegesPanel from './order/OrderPrivilegesPanel';
import OrderStep1Booking from './order/OrderStep1Booking';
import OrderStep2Payment from './order/OrderStep2Payment';
import OrderStep3QrPayment from './order/OrderStep3QrPayment';
import OrderStep3Success from './order/OrderStep3Success';
import OrderProgressStepper from './order/OrderProgressStepper';
import { useOrderSectionState } from './order/useOrderSectionState';
import { usePaymentGatewaysStatus } from './order/usePaymentGatewaysStatus';
import { submitSePayCheckout } from '../utils/submitSePayCheckout';
import SePayRedirectOverlay from './order/SePayRedirectOverlay';

function OrderSection({ cartItems = [], onClearCart } = {}) {
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
    isOrderLocked,
    lockoutReason,
    handleResetLockout,
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
  } = useOrderSectionState(sectionRef, { cartItems, onClearCart });

  const { isMaintenance, isDisabled, getMaintenanceMessage } = usePaymentGatewaysStatus(
    selectedPaymentMethod,
    setSelectedPaymentMethod
  );

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
              
              {/* Imperial Gold Pulse Stepper (Proposal #1 - Always visible across steps 1, 2, 3) */}
              <OrderProgressStepper
                step={step}
                handleBackToStep1={handleBackToStep1}
              />

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
                  isOrderLocked={isOrderLocked}
                  lockoutReason={lockoutReason}
                  handleResetLockout={handleResetLockout}
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
                  isMaintenance={isMaintenance}
                  isDisabled={isDisabled}
                  getMaintenanceMessage={getMaintenanceMessage}
                  isOrderLocked={isOrderLocked}
                  lockoutReason={lockoutReason}
                  handleResetLockout={handleResetLockout}
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

      {/* SEPAY REDIRECT OVERLAY: REASSURING LOADING SCREEN */}
      <SePayRedirectOverlay 
        bookingCode={bookingCode}
        amount={calculatedAmount}
      />
    </section>
  );
}

export default React.memo(OrderSection);
