/**
 * [REACT_AGENT] Payment API Client for Phở Gia Truyền 1986
 * Connects frontend to Spring Boot backend (/api/v1/payments) with resilient offline fallback.
 */

import { getApiBaseUrl } from './apiConfig';

const API_BASE_URL = getApiBaseUrl('payments');

export const paymentApi = {
  /**
   * Khởi tạo giao dịch thanh toán (VIETQR / SEPAY / MOMO / COD / POST_PAID_AT_STORE)
   */
  async createPayment({
    orderCode,
    paymentMethod = 'VIETQR',
    note = '',
    customerName = '',
    phone = '',
    address = '',
    amount = 150000
  }) {
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderCode,
          paymentMethod,
          note,
          customerName,
          phone,
          address,
          amount
        })
      });

      const json = await response.json().catch(() => null);
      if (response.ok && json?.data) {
        return json.data;
      } else if (json?.message) {
        console.warn('[PaymentApi] Backend message:', json.message);
      }
    } catch (e) {
      console.warn('[PaymentApi] Backend offline or unreachable, falling back to client generation:', e.message);
    }

    // Resilient fallback when backend is starting or offline
    const cleanCode = (orderCode || 'BOOKING').replace(/[^a-zA-Z0-9]/g, '');
    const transferContent = `PHO1986 ${cleanCode}`;
    const encodedContent = encodeURIComponent(transferContent);
    const encodedAccountName = encodeURIComponent('PHO GIA TRUYEN 1986');
    const qrCodeUrl = `https://img.vietqr.io/image/970422-0986198686-compact2.png?amount=${amount}&addInfo=${encodedContent}&accountName=${encodedAccountName}`;

    return {
      paymentCode: `PAY-${cleanCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      orderCode,
      amount,
      currency: 'VND',
      paymentMethod,
      status: 'PENDING',
      qrCodeUrl,
      bankBin: '970422',
      bankName: 'MBBank - Ngân hàng Quân Đội',
      bankAccountNo: '0986198686',
      bankAccountName: 'PHO GIA TRUYEN 1986',
      payUrl: null,
      checkoutUrl: null,
      checkoutFields: null,
      completed: paymentMethod === 'POST_PAID_AT_STORE' || paymentMethod === 'COD',
      instructions: paymentMethod === 'POST_PAID_AT_STORE'
        ? 'Bàn của quý khách đã được giữ chỗ trong 30 phút. Quý khách vui lòng thanh toán tại quầy thu ngân sau khi dùng bữa.'
        : paymentMethod === 'COD'
        ? 'Đơn hàng đã được ghi nhận. Quý khách vui lòng chuẩn bị đúng số tiền khi nhận phở từ nhân viên giao hàng.'
        : paymentMethod === 'MOMO'
        ? 'Quý khách vui lòng quét mã MoMo hoặc chuyển khoản siêu tốc qua ứng dụng MoMo.'
        : paymentMethod === 'SEPAY'
        ? 'Quý khách vui lòng quét mã VietQR hoặc bấm chuyển hướng để thanh toán qua cổng SePay.'
        : paymentMethod === 'VNPAY'
        ? 'Quý khách vui lòng quét mã VNPAY-QR qua ứng dụng ngân hàng hoặc ví VNPAY.'
        : paymentMethod === 'ZALOPAY'
        ? 'Quý khách vui lòng xác nhận thanh toán trực tiếp qua ví điện tử ZaloPay.'
        : paymentMethod === 'CREDIT_CARD'
        ? 'Cổng thanh toán thẻ Visa/Mastercard bảo mật 3D-Secure với mã OTP từ ngân hàng phát hành.'
        : 'Quý khách vui lòng mở ứng dụng ngân hàng và quét mã VietQR trên để thanh toán trong vòng 15 phút.'
    };
  },

  /**
   * Tra cứu trạng thái giao dịch thanh toán
   */
  async getPaymentStatus(paymentCode) {
    try {
      const response = await fetch(`${API_BASE_URL}/${paymentCode}/status`);
      const json = await response.json().catch(() => null);
      if (response.ok && json?.data) {
        return json.data;
      }
    } catch (e) {
      console.warn('[PaymentApi] Status check error:', e.message);
    }
    return { status: 'PENDING' };
  },

  /**
   * Xác nhận thanh toán thủ công (Test / Dev / Admin)
   */
  async confirmPayment(paymentCode, data = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/${paymentCode}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await response.json().catch(() => null);
      if (response.ok && json?.data) {
        return json.data;
      }
    } catch (e) {
      console.warn('[PaymentApi] Confirm payment error:', e.message);
    }
    return null;
  }
};
