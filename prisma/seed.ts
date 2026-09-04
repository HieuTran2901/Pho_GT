import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🍜 Bắt đầu gieo dữ liệu hạt giống (Seed Data) cho Phở 1986...");

  // 1. Tạo danh mục món ăn
  const catPhoBo = await prisma.category.upsert({
    where: { slug: "pho-bo-truyen-thong" },
    update: {},
    create: {
      name: "Phở Bò Truyền Thống",
      slug: "pho-bo-truyen-thong",
      displayOrder: 1,
    },
  });

  const catPhoGa = await prisma.category.upsert({
    where: { slug: "pho-ga-ta" },
    update: {},
    create: {
      name: "Phở Gà Ta Chọn Lọc",
      slug: "pho-ga-ta",
      displayOrder: 2,
    },
  });

  const catKem = await prisma.category.upsert({
    where: { slug: "mon-an-kem" },
    update: {},
    create: {
      name: "Món Ăn Kèm Chuẩn Vị",
      slug: "mon-an-kem",
      displayOrder: 3,
    },
  });

  const catDoUong = await prisma.category.upsert({
    where: { slug: "do-uong" },
    update: {},
    create: {
      name: "Giải Khát & Trà Hà Nội",
      slug: "do-uong",
      displayOrder: 4,
    },
  });

  // 2. Tạo món ăn đặc sản
  const dishes = [
    {
      categoryId: catPhoBo.id,
      name: "Phở Bò Tái Nạm Gầu Giòn 1986",
      slug: "pho-tai-nam-gau-1986",
      price: 85000,
      description: "Thịt bò tươi thái mỏng chần tái mềm ngọt, nạm mềm béo cùng gầu giòn sần sật, nước dùng ninh xương ống bò 18 tiếng gia truyền.",
      imageUrl: "/images/pho-tai-nam.jpg",
      isAvailable: true,
      isSignature: true,
    },
    {
      categoryId: catPhoBo.id,
      name: "Phở Bò Tái Lăn Chảo Gang",
      slug: "pho-tai-lan-chao-gang",
      price: 90000,
      description: "Bò bắp đảo nhanh trên chảo gang lửa lớn cùng tỏi đập dập thơm lừng, đậm đà ngậy vị khói.",
      imageUrl: "/images/pho-tai-lan.jpg",
      isAvailable: true,
      isSignature: true,
    },
    {
      categoryId: catPhoBo.id,
      name: "Phở Bò Bắp Hoa Đặc Biệt",
      slug: "pho-bap-hoa-dac-biet",
      price: 95000,
      description: "Từng lát bắp hoa giòn sần sật xen kẽ vân mỡ mỏng thơm phức, nước dùng thanh ngọt đậm hương quế hồi.",
      imageUrl: "/images/pho-bap-hoa.jpg",
      isAvailable: true,
      isSignature: false,
    },
    {
      categoryId: catPhoGa.id,
      name: "Phở Gà Đùi Chặt Lá Chanh",
      slug: "pho-ga-dui-la-chanh",
      price: 80000,
      description: "Gà đồi thả vườn da vàng óng giòn rụm, thịt chắc ngọt thơm thoang thoảng mùi lá chanh tươi cắt chỉ.",
      imageUrl: "/images/pho-ga-dui.jpg",
      isAvailable: true,
      isSignature: false,
    },
    {
      categoryId: catKem.id,
      name: "Quẩy Giòn Gia Truyền (Đĩa 3 chiếc)",
      slug: "quay-gion-gia-truyen",
      price: 15000,
      description: "Quẩy tự làm bột ủ lên men tự nhiên, chiên giòn tan chấm ngập nước phở béo ngọt.",
      imageUrl: "/images/quay-gion.jpg",
      isAvailable: true,
      isSignature: false,
    },
    {
      categoryId: catKem.id,
      name: "Trứng Gà Ta Chần Nước Béo",
      slug: "trung-chan-nuoc-beo",
      price: 15000,
      description: "Trứng gà ta lòng đào béo ngậy chần trong nước dùng sôi sùng sục, rắc thêm tiêu sọ thơm nồng.",
      imageUrl: "/images/trung-chan.jpg",
      isAvailable: true,
      isSignature: false,
    },
    {
      categoryId: catDoUong.id,
      name: "Trà Sen Tây Hồ Truyền Thống",
      slug: "tra-sen-tay-ho",
      price: 25000,
      description: "Trà ướp hoa sen Bách Diệp chuẩn vị Hà thành, thanh mát giải ngấy sau bữa phở thịnh soạn.",
      imageUrl: "/images/tra-sen.jpg",
      isAvailable: true,
      isSignature: false,
    },
  ];

  for (const dish of dishes) {
    await prisma.dish.upsert({
      where: { slug: dish.slug },
      update: dish,
      create: dish,
    });
  }

  // 3. Tạo phần thưởng Loyalty "Bát Phở Tri Kỷ"
  const rewards = [
    {
      title: "01 Đĩa Quẩy Giòn Gia Truyền (3 chiếc)",
      description: "Đổi 80 điểm để nhận miễn phí đĩa quẩy giòn tan nóng hổi.",
      pointsRequired: 80,
      rewardType: "FREE_ITEM",
      discountValue: 15000,
      isActive: true,
    },
    {
      title: "01 Trứng Gà Ta Chần Nước Béo",
      description: "Đổi 100 điểm để thưởng thức lòng đào béo ngậy kèm bát phở.",
      pointsRequired: 100,
      rewardType: "FREE_ITEM",
      discountValue: 15000,
      isActive: true,
    },
    {
      title: "Voucher Giảm 30.000đ Đơn Hàng",
      description: "Đổi 200 điểm để nhận phiếu giảm trực tiếp 30k vào hóa đơn thanh toán.",
      pointsRequired: 200,
      rewardType: "DISCOUNT_CASH",
      discountValue: 30000,
      isActive: true,
    },
    {
      title: "Tặng 01 Bát Phở Bò Tái Nạm Đặc Biệt",
      description: "Phần thưởng cao cấp nhất dành cho Hội viên Tri Kỷ tích lũy đủ 500 điểm.",
      pointsRequired: 500,
      rewardType: "FREE_ITEM",
      discountValue: 85000,
      isActive: true,
    },
  ];

  for (const reward of rewards) {
    const existing = await prisma.loyaltyReward.findFirst({
      where: { title: reward.title },
    });
    if (!existing) {
      await prisma.loyaltyReward.create({ data: reward });
    }
  }

  console.log("✅ Gieo dữ liệu thành công! Đã sẵn sàng phục vụ thực khách.");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
