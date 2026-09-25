package com.pho1986.backend.service.payment;

import com.pho1986.backend.model.dto.OrderDtos.CreateOrderItemRequest;
import com.pho1986.backend.model.entity.Dish;
import com.pho1986.backend.model.entity.Order;
import com.pho1986.backend.model.entity.OrderItem;
import com.pho1986.backend.repository.DishRepository;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class PaymentOrderValidator {

    public List<OrderItem> buildAndVerifyOrderItems(List<CreateOrderItemRequest> requests, DishRepository dishRepository) {
        if (requests == null || requests.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Kiểm tra bắt buộc dishId trên từng món ăn
        for (CreateOrderItemRequest r : requests) {
            if (!StringUtils.hasText(r.getDishId())) {
                throw new IllegalArgumentException("Mã món ăn (dishId) không hợp lệ hoặc để trống trong yêu cầu đặt hàng.");
            }
        }

        List<String> dishIds = requests.stream()
                .map(CreateOrderItemRequest::getDishId)
                .map(String::trim)
                .distinct()
                .toList();

        // 2. Batch fetch từ DishRepository để triệt tiêu N+1 queries theo TEST-R015
        Map<String, Dish> dishMap = dishRepository.findAllById(dishIds).stream()
                .collect(Collectors.toMap(Dish::getId, Function.identity(), (a, b) -> a));

        List<OrderItem> items = new ArrayList<>();

        for (CreateOrderItemRequest r : requests) {
            String dishId = r.getDishId().trim();
            Dish dish = dishMap.get(dishId);

            // 3. Từ chối ngay lập tức nếu món ăn không tồn tại trong database
            if (dish == null) {
                throw new IllegalArgumentException("Món ăn không tồn tại trong thực đơn: " + dishId);
            }

            // 4. Từ chối ngay nếu món ăn tạm hết hàng (isAvailable == false)
            if (Boolean.FALSE.equals(dish.getIsAvailable())) {
                throw new IllegalArgumentException("Món \"" + dish.getName() + "\" hiện đang tạm hết hàng tại quán. Quý khách vui lòng chọn món khác.");
            }

            // 5. Đơn giá và thành tiền bắt buộc lấy 100% từ server database (loại bỏ fallback client unitPrice)
            Double price = dish.getPrice();
            if (price == null || price <= 0) {
                throw new IllegalArgumentException("Đơn giá món ăn không hợp lệ trong hệ thống: " + dishId);
            }

            if (r.getQuantity() != null && r.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng món ăn phải lớn hơn 0: " + dishId);
            }
            int qty = (r.getQuantity() != null) ? r.getQuantity() : 1;
            double subtotal = price * qty;
            String name = StringUtils.hasText(dish.getName()) ? dish.getName() : r.getDishName();

            items.add(new OrderItem(dishId, name, price, qty, subtotal, r.getCustomizedOptions()));
        }

        return items;
    }

    /**
     * Xác thực và tính lại toàn bộ đơn giá 100% từ DB cho đơn hàng đã tồn tại (chống can thiệp giá từ OrderService/Guest)
     */
    public void recalculateAndVerifyExistingOrder(Order order, DishRepository dishRepository) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException("Đơn hàng không có món ăn hợp lệ để xử lý thanh toán.");
        }

        List<String> dishIds = order.getItems().stream()
                .map(OrderItem::getDishId)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .distinct()
                .toList();

        Map<String, Dish> dishMap = dishIds.isEmpty() ? Collections.emptyMap() :
                dishRepository.findAllById(dishIds).stream()
                        .collect(Collectors.toMap(Dish::getId, Function.identity(), (a, b) -> a));

        boolean priceUpdated = false;
        for (OrderItem item : order.getItems()) {
            String dishId = (item.getDishId() != null) ? item.getDishId().trim() : null;

            if (!StringUtils.hasText(dishId)) {
                throw new IllegalArgumentException("Mã món ăn (dishId) không hợp lệ hoặc để trống trong đơn hàng.");
            }

            Dish dish = dishMap.get(dishId);
            if (dish == null) {
                throw new IllegalArgumentException("Món ăn không tồn tại trong thực đơn: " + dishId);
            }
            if (Boolean.FALSE.equals(dish.getIsAvailable())) {
                throw new IllegalArgumentException("Món \"" + dish.getName() + "\" hiện đang tạm hết hàng tại quán. Quý khách vui lòng chọn món khác.");
            }
            Double price = dish.getPrice();
            if (price == null || price <= 0) {
                throw new IllegalArgumentException("Đơn giá món ăn không hợp lệ trong hệ thống: " + dishId);
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new IllegalArgumentException("Số lượng món ăn phải lớn hơn 0: " + dishId);
            }

            // Ghi đè đơn giá và thành tiền từ Server Database
            item.setUnitPrice(price);
            item.setSubtotal(price * item.getQuantity());
            if (StringUtils.hasText(dish.getName())) {
                item.setDishName(dish.getName());
            }
            priceUpdated = true;
        }

        if (priceUpdated) {
            double verifiedTotal = order.getItems().stream().mapToDouble(OrderItem::getSubtotal).sum();
            order.setTotalAmount(verifiedTotal);
            double discount = (order.getDiscountAmount() != null && order.getDiscountAmount() > 0) ? order.getDiscountAmount() : 0.0;
            order.setFinalAmount(Math.max(0.0, verifiedTotal - discount));
        }
    }


    public boolean hasVerifiedMainDish(List<OrderItem> items, DishRepository dishRepository) {
        if (items == null || items.isEmpty()) {
            return false;
        }
        List<String> dishIds = items.stream()
                .map(OrderItem::getDishId)
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

        if (!dishIds.isEmpty()) {
            Map<String, Dish> dishMap = dishRepository.findAllById(dishIds).stream()
                    .collect(Collectors.toMap(Dish::getId, Function.identity(), (a, b) -> a));
            boolean hasMainFromDb = dishIds.stream().anyMatch(id -> isMainDish(dishMap.get(id)));
            if (hasMainFromDb) {
                return true;
            }
        }

        // Dự phòng cho đơn hàng legacy/test không lưu dishId mà chỉ có tên món
        return items.stream().anyMatch(item -> {
            if (StringUtils.hasText(item.getDishName())) {
                String name = item.getDishName().toLowerCase();
                return name.contains("phở") || name.contains("pho");
            }
            return false;
        });
    }

    public boolean isMainDish(Dish dish) {
        if (dish == null || dish.getPrice() == null || dish.getPrice() <= 0) {
            return false;
        }
        if (dish.getCategory() == null || dish.getCategory().getSlug() == null) {
            return false;
        }
        String slug = dish.getCategory().getSlug().toLowerCase();
        return !slug.contains("mon-an-kem") && !slug.contains("do-uong");
    }
}
