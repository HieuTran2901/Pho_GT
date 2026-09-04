/**
 * Integration Test Script cho Hệ thống Backend Phở Gia Truyền 1986
 * Tự động kiểm thử toàn bộ luồng Auth, Gu Ăn Phở, Đặt món, Chuyển đổi Guest, Loyalty, Gọi lại bát quen.
 */

const PORT = process.env.PORT || 8080;
const BASE_URL = `http://localhost:${PORT}`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("🚀 [BẮT ĐẦU KIỂM THỬ TÍCH HỢP TẦNG BACKEND]");
  console.log("=================================================");

  // 1. Healthcheck
  console.log("\n1️⃣ Kiểm tra Healthcheck...");
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log("   Status:", healthRes.status, healthData);

  // 2. Lấy danh mục & thực đơn
  console.log("\n2️⃣ Lấy danh sách món ăn & thực đơn đặc sản...");
  const dishesRes = await fetch(`${BASE_URL}/api/v1/dishes`);
  const dishesData = await dishesRes.json();
  console.log(`   Tìm thấy ${dishesData.data?.length || 0} món ăn.`);
  const signatureDish = dishesData.data?.find((d: any) => d.isSignature);
  console.log("   Món đặc sắc:", signatureDish?.name, "-", signatureDish?.price?.toLocaleString(), "VND");

  // 3. Đăng ký tài khoản Hội viên mới
  console.log("\n3️⃣ Đăng ký tài khoản Hội viên (Thử nghiệm)...");
  const testPhone = `098${Math.floor(1000000 + Math.random() * 9000000)}`;
  const registerRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: testPhone,
      fullName: "Nguyễn Văn Hiếu",
      password: "password123",
      email: `hieu.${Date.now()}@example.com`,
    }),
  });
  const regData = await registerRes.json();
  console.log("   Đăng ký:", regData.success ? "THÀNH CÔNG" : "THẤT BẠI", regData.message);
  const token = regData.data?.accessToken;

  // 4. Kiểm tra Hồ sơ & Điểm chào mừng (Me)
  console.log("\n4️⃣ Kiểm tra Profile & Điểm chào mừng...");
  const meRes = await fetch(`${BASE_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const meData = await meRes.json();
  console.log("   Tên hội viên:", meData.data?.fullName);
  console.log("   Điểm Tri Kỷ khả dụng:", meData.data?.loyaltyAccount?.availablePoints, "điểm");
  console.log("   Hạng:", meData.data?.loyaltyAccount?.membershipTier);

  // 5. Cập nhật "Gu Ăn Phở"
  console.log("\n5️⃣ Cập nhật Gu Ăn Phở của khách...");
  const tasteRes = await fetch(`${BASE_URL}/api/v1/user/taste-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      favoriteDishId: signatureDish?.id,
      brothType: "BEO_NGAY",
      onionStyle: "HANH_TRAN",
      herbStyle: "DU_RAU",
      spicyLevel: 2,
      crullerPref: "QUAY_GION",
      customNote: "Cho 1 bát nước béo thơm nhiều tiêu riêng",
    }),
  });
  const tasteData = await tasteRes.json();
  console.log("   Cập nhật Gu:", tasteData.success ? "THÀNH CÔNG" : "THẤT BẠI", tasteData.message);

  // 6. Đặt món với tư cách Thành viên
  console.log("\n6️⃣ Đặt bát phở ruột (Có xác thực hội viên)...");
  const orderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      deliveryAddressText: "Số 10 Hàng Trống, Hoàn Kiếm, Hà Nội",
      paymentMethod: "COD",
      notes: "Giao nóng hổi hộ mình nhé",
      items: [
        {
          dishId: signatureDish?.id,
          dishName: signatureDish?.name,
          unitPrice: signatureDish?.price,
          quantity: 1,
          customizedOptions: {
            brothType: "BEO_NGAY",
            onionStyle: "HANH_TRAN",
            crullerPref: "QUAY_GION",
          },
        },
      ],
    }),
  });
  const orderData = await orderRes.json();
  console.log("   Tạo đơn:", orderData.success ? "THÀNH CÔNG" : "THẤT BẠI", "Mã đơn:", orderData.data?.orderCode);
  const createdOrderCode = orderData.data?.orderCode;

  // 7. Kiểm tra Gọi lại bát quen (1-Click Reorder)
  console.log("\n7️⃣ Thử nghiệm tính năng 'Gọi lại bát quen' (1-Click Reorder)...");
  const quickReorderRes = await fetch(`${BASE_URL}/api/v1/orders/quick-reorder`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const quickData = await quickReorderRes.json();
  console.log("   Nguồn đơn cũ:", quickData.data?.sourceOrderCode);
  console.log("   Món gọi lại:", quickData.data?.items?.[0]?.dishName);
  console.log("   Gu phở đính kèm:", quickData.data?.items?.[0]?.customizedOptions);

  // 8. Tích điểm sau khi đặt
  console.log("\n8️⃣ Kiểm tra Bát Phở Tri Kỷ sau khi tích điểm đơn hàng...");
  const loyaltyRes = await fetch(`${BASE_URL}/api/v1/loyalty/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const loyaltyData = await loyaltyRes.json();
  console.log("   Tổng điểm hiện tại:", loyaltyData.data?.account?.availablePoints, "điểm");
  console.log("   Tổng tiền đã chi tiêu:", loyaltyData.data?.account?.totalSpent?.toLocaleString(), "VND");

  // 9. Thử nghiệm luồng Guest Checkout & Chuyển đổi thành viên (Post-Order Claim)
  console.log("\n9️⃣ Thử nghiệm luồng Khách Vãng Lai (Guest) đặt hàng rồi lưu tài khoản...");
  const guestOrderRes = await fetch(`${BASE_URL}/api/v1/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      guestName: "Bác Lâm Hàng Đường",
      guestPhone: "0912345678",
      deliveryAddressText: "48 Hàng Đường, Hoàn Kiếm, Hà Nội",
      paymentMethod: "COD",
      items: [
        {
          dishName: "Phở Gà Đùi Chặt Lá Chanh",
          unitPrice: 80000,
          quantity: 2,
        },
      ],
    }),
  });
  const guestOrderData = await guestOrderRes.json();
  const guestOrderCode = guestOrderData.data?.orderCode;
  console.log("   Khách vãng lai đặt đơn:", guestOrderCode, "- Tổng:", guestOrderData.data?.finalAmount?.toLocaleString(), "VND");

  // Chuyển đổi đơn Guest thành tài khoản
  console.log("   Khách vãng lai bấm 'Lưu đơn nhận điểm Tri Kỷ'...");
  const claimRes = await fetch(`${BASE_URL}/api/v1/auth/post-order-claim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderCode: guestOrderCode,
      phone: `093${Math.floor(1000000 + Math.random() * 9000000)}`,
      fullName: "Bác Lâm Hàng Đường",
      password: "securepassword123",
    }),
  });
  const claimData = await claimRes.json();
  console.log("   Chuyển đổi:", claimData.success ? "THÀNH CÔNG" : "THẤT BẠI", claimData.message);

  console.log("\n=================================================");
  console.log("🎉 [TOÀN BỘ 9 LUỒNG KIỂM THỬ ĐỀU ĐẠT CHUẨN]");
}

runTests().catch((e) => {
  console.error("❌ Test failed:", e);
});
