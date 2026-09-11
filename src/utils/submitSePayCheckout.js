/**
 * [REACT_AGENT] SePay Checkout POST Form Submission
 * Mirrors the production pattern from ai-travel-marketplace/src/utils/submitSePayCheckout.ts.
 * Dispatches 'sepay:redirect_start' event so the UI immediately renders the SePayRedirectOverlay,
 * then safely executes form.submit() to transition to SePay gateway.
 */

export function submitSePayCheckout({ checkoutUrl, checkoutFields }) {
  if (!checkoutUrl || !checkoutFields || Object.keys(checkoutFields).length === 0) {
    console.warn('[submitSePayCheckout] Missing checkoutUrl or checkoutFields');
    return false;
  }

  // 1. Dispatch custom event so SePayRedirectOverlay appears immediately
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('sepay:redirect_start', {
          detail: {
            checkoutUrl,
            checkoutFields,
            invoiceNumber: checkoutFields?.order_invoice_number || '',
            amount: checkoutFields?.order_amount || ''
          }
        })
      );
    } catch (e) {
      console.warn('[submitSePayCheckout] Failed to dispatch sepay:redirect_start:', e);
    }
  }

  // 2. Prepare invisible form
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = checkoutUrl;
  form.style.display = 'none';

  Object.entries(checkoutFields).forEach(([name, rawValue]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(rawValue);
    form.appendChild(input);
  });

  document.body.appendChild(form);

  // 3. Short 150ms timeout ensures UI repaints the overlay modal smoothly before full-page navigation
  setTimeout(() => {
    try {
      form.submit();
    } catch (err) {
      console.error('[submitSePayCheckout] Form submit error:', err);
    }
  }, 150);

  return true;
}
