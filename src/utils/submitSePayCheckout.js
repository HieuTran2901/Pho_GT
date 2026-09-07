/**
 * [REACT_AGENT] SePay Checkout POST Form Submission
 * Mirrors the production pattern from ai-travel-marketplace/src/utils/submitSePayCheckout.ts.
 * Creates an invisible form in the DOM and submits POST fields to SePay hosted checkout.
 */

export function submitSePayCheckout({ checkoutUrl, checkoutFields }) {
  if (!checkoutUrl || !checkoutFields || Object.keys(checkoutFields).length === 0) {
    console.warn('[submitSePayCheckout] Missing checkoutUrl or checkoutFields');
    return false;
  }

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
  form.submit();
  return true;
}
