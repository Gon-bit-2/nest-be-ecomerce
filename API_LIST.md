# List of APIs

Base URL: `localhost:9999`

## Auth Module

### Send OTP

**POST** `/auth/otp`

_No Auth Headers_

```json
{
  "email": "user@example.com",
  "type": "REGISTER" // REGISTER, FORGOT_PASSWORD, LOGIN, DISABLE_2FA
}
```

### Verify OTP

**POST** `/auth/verify-otp`

_No Auth Headers_

```json
{
  "email": "user@example.com",
  "code": "123456",
  "type": "REGISTER" // REGISTER, FORGOT_PASSWORD, LOGIN, DISABLE_2FA,
}
```

### Register

**POST** `/auth/register`

_No Auth Headers_

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name",
  "phoneNumber": "0123456789",
  "confirmPassword": "password123",
  "code": "123456"
}
```

### Login

**POST** `/auth/login`

_No Auth Headers_

```json
{
  "email": "admin@gmail.com",
  "password": "password123",
  "totpCode": "123456", // Optional_
  "code": "123456" // Optional
}
```

### Refresh Token

**POST** `/auth/refresh-token`

_No Auth Headers_

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

**POST** `/auth/logout`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Google Authorization URL

**GET** `/auth/google-link`

_No Auth Headers_
_No Body_

### Google Callback

**GET** `/auth/google/callback?state=...&code=...`

_No Auth Headers_
_No Body_

### Forgot Password

**POST** `/auth/forgot-password`

_No Auth Headers_

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newPassword123",
  "confirmNewPassword": "newPassword123"
}
```

### Setup 2FA

**POST** `/auth/2fa/setup`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{}
```

**Response:**

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "url": "otpauth://totp/E-commerce:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=E-commerce"
}
```

**Note:** Setup chỉ tạo secret tạm thời. 2FA chỉ được bật sau khi gọi endpoint verify bên dưới với mã TOTP hợp lệ.

### Verify 2FA

**POST** `/auth/2fa/verify`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "totpCode": "123456"
}
```

**Response:**

```json
{
  "message": "Bật 2FA Thành Công"
}
```

### Disable 2FA

**POST** `/auth/2fa/disable`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "totpCode": "123456", // Provide EITHER totpCode (from App) OR code (OTP from email)
  "code": "123456"
}
```

---

## Product Translation Module

### Get Product Translation Detail

**GET** `/product-translation/:productTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Product Translation

**POST** `/product-translation`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "productId": 1,
  "languageId": "vi",
  "name": "Áo Thun Premium",
  "description": "Mô tả sản phẩm"
}
```

### Update Product Translation

**PATCH** `/product-translation/:productTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "productId": 1,
  "languageId": "vi",
  "name": "Áo Thun Premium V2",
  "description": "Mô tả sản phẩm cập nhật"
}
```

### Delete Product Translation

**DELETE** `/product-translation/:productTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## User Module

### List Users

**GET** `/user?page=1&limit=10`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Get User Detail

**GET** `/user/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create User

**POST** `/user`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "phoneNumber": "0987654321",
  "avatar": "https://example.com/avatar.jpg",
  "status": "ACTIVE", // ACTIVE, INACTIVE, BLOCKED
  "password": "password123",
  "roleId": 1
}
```

### Update User

**PUT** `/user/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "email": "updated@example.com", // Optional, partial update usually allowed if same DTO, but here code says CreateUserBodySchema for Update.
  "name": "Updated Name",
  "phoneNumber": "0987654321",
  "avatar": "https://example.com/updated-avatar.jpg",
  "status": "ACTIVE",
  "password": "newpassword123",
  "roleId": 1
}
```

### Delete User

**DELETE** `/user/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Profile Module

### Get Profile

**GET** `/profile`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

**Response includes:**

- `isTwoFactorEnabled`: boolean - Indicates if user has 2FA enabled
- User information (email, name, phoneNumber, avatar, status, role with permissions)

### Update Profile

**PUT** `/profile`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "My Updated Name",
  "phoneNumber": "0123456789",
  "avatar": "https://example.com/my-avatar.jpg"
}
```

### Change Password

**PUT** `/profile/change-password`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "password": "currentPassword",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

---

## Language Module

### Create Language

**POST** `/language`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "id": "vi",
  "name": "Tiếng Việt"
}
```

### List Languages

**GET** `/language`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Get Language Detail

**GET** `/language/:languageId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Update Language

**PUT** `/language/:languageId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "English"
}
```

### Delete Language

**DELETE** `/language/:languageId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Media Module

### Upload Image

**POST** `/media/images/upload`

**Headers**

- `Authorization`: `Bearer <accessToken>`
- `Content-Type`: `multipart/form-data`

_Form Data:_

- `file`: (Binary File) — Hỗ trợ: JPEG, JPG, PNG, WebP. Max 5MB/file. Có thể upload nhiều file cùng lúc.

**Response:**

```json
{
  "data": [
    {
      "url": "https://res.cloudinary.com/xxx/image/upload/v.../images/abc123.png",
      "name": "product-image.png",
      "key": "images/abc123",
      "type": "image/png"
    }
  ]
}
```

### Upload Video

**POST** `/media/videos/upload`

**Headers**

- `Authorization`: `Bearer <accessToken>`
- `Content-Type`: `multipart/form-data`

_Form Data:_

- `file`: (Binary File) — Hỗ trợ: MP4, WebM, QuickTime, AVI, MKV. Max 100MB/file. Tối đa 10 file.

**Response:**

```json
{
  "data": [
    {
      "url": "https://res.cloudinary.com/xxx/video/upload/v.../videos/video123.mp4",
      "name": "shop-video.mp4",
      "key": "videos/video123",
      "type": "video/mp4"
    }
  ]
}
```

### Serve Static File

**GET** `/media/static/:filename`

_No Auth Headers_
_No Body_

### Get Presigned URL

**POST** `/media/images/upload/presigned-url`

_No Auth Headers_

```json
{
  "fileName": "image.png",
  "fileSize": "1024"
}
```

> **Lưu ý:** Toàn bộ file (ảnh/video) hiện được lưu trữ trên **Cloudinary**. URL trả về sẽ có dạng `https://res.cloudinary.com/...`.

---

## Permission Module

### List Permissions

**GET** `/permission?page=1&limit=10`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Get Permission Detail

**GET** `/permission/:permissionId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Permission

**POST** `/permission`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Create User",
  "path": "/user",
  "method": "POST", // GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
  "module": "User"
}
```

### Update Permission

**PATCH** `/permission/:permissionId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Update User",
  "path": "/user/:id",
  "method": "PUT",
  "module": "User"
}
```

### Delete Permission

**DELETE** `/permission/:permissionId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Role Module

### List Roles

**GET** `/role?page=1&limit=10`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Get Role Detail

**GET** `/role/:roleId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Role

**POST** `/role`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Admin",
  "description": "Administrator role",
  "isActive": true
}
```

### Update Role

**PUT** `/role/:roleId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Super Admin",
  "description": "Super Administrator",
  "isActive": true,
  "permissionIds": [1, 2, 3]
}
```

### Delete Role

**DELETE** `/role/:roleId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Brand Module

### List Brands

**GET** `/brand?page=1&limit=10`

_No Auth Headers_
_No Body_

### Get Brand Detail

**GET** `/brand/:id`

_No Auth Headers_
_No Body_

### Create Brand

**POST** `/brand`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Nike",
  "logo": "https://example.com/nike-logo.png"
}
```

### Update Brand

**PUT** `/brand/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Adidas",
  "logo": "https://example.com/adidas-logo.png"
}
```

### Delete Brand

**DELETE** `/brand/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Brand Translation Module

### Get Brand Translation Detail

**GET** `/brand-translation/:brandTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Brand Translation

**POST** `/brand-translation`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "brandId": 1,
  "languageId": "vi",
  "name": "Thương hiệu Nike",
  "description": "Mô tả chi tiết về Nike bằng tiếng Việt"
}
```

### Update Brand Translation

**PUT** `/brand-translation/:brandTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "brandId": 1,
  "languageId": "vi",
  "name": "Thương hiệu Nike Updated",
  "description": "Mô tả chi tiết về Nike đã cập nhật"
}
```

### Delete Brand Translation

**DELETE** `/brand-translation/:brandTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Category Module

### List Categories

**GET** `/categories?parentCategoryId=1`

_No Auth Headers_
_No Body_

### Get Category Detail

**GET** `/categories/:id`

_No Auth Headers_
_No Body_

### Create Category

**POST** `/categories`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Electronics",
  "logo": "https://example.com/logo.png",
  "parentCategoryId": null // Or parent category ID like 1
}
```

### Update Category

**PUT** `/categories/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Laptops",
  "logo": "https://example.com/logo.png",
  "parentCategoryId": 1
}
```

### Delete Category

**DELETE** `/categories/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Category Translation Module

### Get Category Translation Detail

**GET** `/category-transaliton/:categoryTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Category Translation

**POST** `/category-transaliton`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "categoryId": 1,
  "languageId": "vi",
  "name": "Điện tử",
  "description": "Các thiết bị điện tử"
}
```

### Update Category Translation

**PUT** `/category-transaliton/:categoryTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "categoryId": 1,
  "languageId": "vi",
  "name": "Điện tử gia dụng",
  "description": "Các thiết bị điện tử dùng trong gia đình"
}
```

### Delete Category Translation

**DELETE** `/category-transaliton/:categoryTranslationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Product Module (Public)

### List Products

**GET** `/product?page=1&limit=10&name=Shirt&minPrice=10000&maxPrice=500000`

_No Auth Headers_
_No Body_

**Query Params:**

- `page`: number (default 1)
- `limit`: number (default 10)
- `name`: string (optional)
- `brandIds`: number[] (optional)
- `categories`: number[] (optional)
- `minPrice`: number (optional)
- `maxPrice`: number (optional)
- `createdById`: number (optional)
- `orderBy`: "ASC" | "DESC" (default "DESC")
- `sortBy`: "price" | "createdAt" | "sale" (default "createdAt")

### Search Products

**GET** `/product/search?q=keyword&page=1&limit=10`

_No Auth Headers_
_No Body_

**Query Params:**

- `q`: string (required) — search keyword
- `page`: number (default 1)
- `limit`: number (default 10)
- `orderBy`: "asc" | "desc" (default "desc")
- `sortBy`: "price" | "createdAt" | "sale" (default "createdAt")

### Get Product Detail

**GET** `/product/:productId`

_No Auth Headers_
_No Body_

### Get Product Variants

**GET** `/product/:productId/variants`

_No Auth Headers_
_No Body_

**Response:**

Trả về danh sách các phiên bản (SKUs / phân loại như Màu sắc, Kích thước) của sản phẩm. Được sử dụng chủ yếu trên Shop Video Feed khi người dùng bấm "Chọn loại".

---

## Manage Product Module (Admin/Seller)

### List Products (Manage)

**GET** `/manage-product/products?page=1&limit=10&createdById=1&isPublic=true`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Get Product Detail (Manage)

**GET** `/manage-product/products/:productId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Product

**POST** `/manage-product/products`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "publishedAt": "2023-10-27T00:00:00.000Z",
  "name": "Áo Thun Premium",
  "basePrice": 200000,
  "virtualPrice": 300000,
  "brandId": 1,
  "categories": [1, 2],
  "images": ["https://example.com/product-image-1.jpg", "https://example.com/product-image-2.jpg"],
  "variants": [
    {
      "value": "Color",
      "options": ["Red", "Blue"]
    },
    {
      "value": "Size",
      "options": ["S", "M", "L"]
    }
  ],
  "skus": [
    {
      "value": "Red-S",
      "price": 200000,
      "stock": 100,
      "image": "https://example.com/red-s.jpg"
    },
    {
      "value": "Red-M",
      "price": 200000,
      "stock": 100,
      "image": "https://example.com/red-m.jpg"
    }
    // ... more SKUs (total should match variants combinations: 2 colors x 3 sizes = 6 SKUs)
  ]
}
```

**Important Notes:**

- `images`: Must be an **array of URL strings**. To get image URLs:
  1. First upload images via **POST** `/media/images/upload` with form-data
  2. The response will be: `{ "data": [{ "url": "https://...", "name": "...", "key": "...", "type": "..." }] }`
  3. Extract only the `url` field from each item in `data` array
  4. Send these URLs in the `images` field: `["https://url1.jpg", "https://url2.jpg"]`

  ❌ **Wrong**: `["{data: [{url: https://...}]}"]` (stringified object)  
  ✅ **Correct**: `["https://url1.jpg", "https://url2.jpg"]` (array of strings)

- `skus`: Number of SKUs must match the total combinations of variants
  - Example: 2 colors × 3 sizes = 6 SKUs required

### Update Product

**PUT** `/manage-product/products/:productId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  // Same fields as Create Product, all optional
  "name": "Updated Name"
}
```

### Delete Product

**DELETE** `/manage-product/products/:productId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Cart Module

### Get Cart

**GET** `/cart`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Query Params:**

- `page`: number (default 1)
- `limit`: number (default 10)

### Add to Cart

**POST** `/cart`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "skuId": 1,
  "quantity": 1
}
```

### Update Cart Item

**PUT** `/cart`

_Note: Currently expects `cartItemId` via parameters but route definition may need adjustment to `/cart/:cartItemId` for strict REST compliance. Documenting as per current code which likely expects params._

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "skuId": 1,
  "quantity": 2
}
```

### Delete Cart items

**POST** `/cart/delete`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "cartItemIds": [1, 2]
}
```

---

## Order Module

### Get Order List

**GET** `/order`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Query Params:**

- `page`: number (default 1)
- `limit`: number (default 10)
- `status`: "UNPAID" | "READY_TO_SHIP" | "SHIPPED" | "COMPLETED" | "TO_RETURN" | "CANCELLED" (Optional)

### Get Order Detail

**GET** `/order/:orderId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Order

**POST** `/order`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
[
  {
    "shopId": 1,
    "shippingFee": 30000,
    "receiver": {
      "name": "John Doe",
      "phone": "0123456789",
      "address": "123 St, City"
    },
    "cartItemIds": [1, 2],
    "shopDiscountCode": "SHOP10",
    "platformDiscountCode": "PLATFORM20"
  }
]
```

**Note:** Either `receiver` or `userAddressId` must be provided. You can use a saved address instead of manually providing receiver info:

```json
[
  {
    "shopId": 1,
    "shippingFee": 30000,
    "userAddressId": 1,
    "cartItemIds": [1, 2],
    "shopDiscountCode": "SHOP10"
  }
]
```

**Các field voucher (optional):**

| Field                  | Mô tả                              |
| ---------------------- | ---------------------------------- |
| `shippingFee`          | Phí vận chuyển của đơn theo shop   |
| `shopDiscountCode`     | Mã voucher của shop (scope `SHOP`) |
| `platformDiscountCode` | Mã voucher sàn (scope `PLATFORM`)  |

- Có thể truyền cả 2 code cùng lúc (1 Shop + 1 Platform)
- Không bắt buộc — nếu không truyền thì đơn hàng không áp dụng voucher
- `shippingFee` có thể bỏ qua, backend sẽ dùng mặc định `0`; nên truyền giá trị thực tế để voucher `SHIPPING` tính chính xác
- Hệ thống tự động validate mã, tính giảm giá, và tạo `DiscountUsage` trong cùng transaction
- `shopDiscountCode` phải là voucher scope `SHOP` của đúng `shopId`; `platformDiscountCode` phải là voucher scope `PLATFORM`
- Nếu mã không hợp lệ (hết hạn, hết lượt, không đủ điều kiện) → trả lỗi `400 Bad Request`

**Response:**

```json
{
  "paymentId": 123,
  "orders": [
    {
      "id": 1,
      "userId": 1,
      "shopId": 1,
      "status": "UNPAID",
      "discountAmount": 30000,
      "shippingFee": 0,
      "receiver": { "name": "...", "phone": "...", "address": "..." },
      "paymentId": 123
    }
  ]
}
```

- `discountAmount`: Tổng số tiền đã được giảm giá (bao gồm cả shop + platform voucher). Mặc định `0` nếu không dùng voucher.

### Cancel Order

**PUT** `/order/:orderId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

**Lưu ý:**

- Chỉ hủy được đơn hàng ở trạng thái `UNPAID`
- Khi hủy đơn, hệ thống tự động **hoàn voucher** cho user:
  - Giảm `useCount` trên mỗi Discount đã áp dụng
  - Reset `UserSavedDiscount.isUsed = false` (nếu user đã lưu voucher trước đó)
  - Xóa `DiscountUsage` records của đơn hàng
  - User có thể dùng lại voucher cho đơn hàng khác

### Update Order Status

**POST** `/order/:orderId/status`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "status": "SHIPPED" // UNPAID, READY_TO_SHIP, SHIPPED, COMPLETED, TO_RETURN, CANCELLED
}
```

**Transition hợp lệ hiện tại:**

- UNPAID -> READY_TO_SHIP hoặc CANCELLED
- READY_TO_SHIP -> SHIPPED
- SHIPPED -> COMPLETED hoặc TO_RETURN
- COMPLETED -> TO_RETURN
- TO_RETURN, CANCELLED là trạng thái cuối

---

## Payment Module

### Payment Flow Overview

1. Frontend gọi `GET /payment/config` → Lấy thông tin ngân hàng (`accountNumber`, `bankCode`, `prefix`)
2. Frontend gọi `POST /order` → Backend tạo đơn hàng + Payment (PENDING) → Trả về `paymentId`
3. Frontend gen QR Code từ `paymentId` + thông tin bank config → User chuyển khoản
4. SePay phát hiện giao dịch → Gọi Webhook `POST /payment/receiver` (Thông qua domain public của Backend, ví dụ Ngrok URL)
5. Backend xác nhận thanh toán → Cập nhật Order sang `READY_TO_SHIP` → Emit WebSocket event `payment` tới user
6. Nếu không thanh toán trong 24h → Tự động hủy đơn, hoàn lại stock

### Get Payment Config

**GET** `/payment/config`

_No Auth Headers_ (Public)

**Response:**

```json
{
  "accountNumber": "0123456789",
  "bankCode": "VCB",
  "prefix": "PM"
}
```

**Mô tả:** Trả về thông tin tài khoản ngân hàng nhận tiền và prefix nội dung chuyển khoản. Frontend dùng response này để gen mã QR SePay:

```
https://qr.sepay.vn/img?acc={accountNumber}&bank={bankCode}&amount={totalAmount}&des={prefix}{paymentId}
```

### Get Payment Status

**GET** `/payment/:paymentId/status`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Response:**

```json
{
  "status": "PENDING" // "PENDING" | "SUCCESS" | "FAILED"
}
```

**Mô tả:** Frontend dùng API này để chủ động kiểm tra trạng thái thanh toán (Fallback Checking) khi người dùng bấm nút "Tôi đã thanh toán".

### Webhook Receiver (SePay)

**POST** `/payment/receiver` (Nhận qua Public Domain, VD: `https://guardlike-danica-unguileful.ngrok-free.app/payment/receiver` thay vì localhost)

_No Auth Headers_ (Public Endpoint — Secured by API Key header)

```json
{
  "id": 12345,
  "gateway": "VCB",
  "transactionDate": "2023-10-27 10:00:00",
  "accountNumber": "0123456789",
  "subAccount": null,
  "code": "PM123",
  "content": "PM123",
  "transferType": "in", // "in" = tiền vào, "out" = tiền ra
  "transferAmount": 100000,
  "accumulated": 500000,
  "referenceCode": null,
  "description": "Full sms content"
}
```

**Xử lý Backend:**

- Backend trích xuất `paymentId` từ `code` hoặc `content` bằng prefix `PM` (ví dụ `PM123` → paymentId = 123)
- Kiểm tra `transferAmount` có bằng tổng tiền đơn hàng không
- Nếu hợp lệ → cập nhật Payment `SUCCESS`, Orders `READY_TO_SHIP`, xóa job auto-cancel
- Gửi WebSocket event `payment` với `{ status: 'success' }` tới user

### WebSocket Payment Notification

**Namespace:** `payment`

**Event:** `payment`

**Data:**

```json
{
  "status": "success"
}
```

**Lưu ý:** Frontend cần kết nối vào namespace `payment` của WebSocket (không phải namespace mặc định) để nhận thông báo thanh toán thành công real-time.

---

## Discount Module

### List Discounts (Admin)

**GET** `/discount?page=1&limit=10`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Query Params:**

- `page`: number (default 1)
- `limit`: number (default 10)
- `search`: string (optional)
- `type`: "PERCENTAGE" | "FIXED_AMOUNT" | "SHIPPING" | "COIN_CASHBACK" (optional)
- `scope`: "PLATFORM" | "SHOP" (optional)
- `isActive`: boolean (optional)
- `shopId`: number (optional)

### List Available Discounts

**GET** `/discount/available?page=1&limit=10`

**Headers**

- `Authorization`: `Bearer <accessToken>`

### List My Vouchers

**GET** `/discount/my-vouchers?page=1&limit=10`

**Headers**

- `Authorization`: `Bearer <accessToken>`

### Get Discount Detail

**GET** `/discount/:discountId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

### Create Discount (Admin, Seller)

**POST** `/discount`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Lưu ý quan trọng về Quyền:**

- **Seller (Cửa hàng):** Chỉ có thể tạo mã với `scope="SHOP"`. Backend sẽ tự động gán `shopId` bằng ID của cửa hàng (tương đương `userId` của Admin của shop đó). Hệ thống cũng sẽ kiểm tra danh sách `productIds` truyền lên có thực sự thuộc quyền sở hữu của chính Shop đó hay không.
- **Admin (Quản trị viên):** Có quyền tạo mã với `scope="PLATFORM"` (mã áp dụng toàn sàn). Khi đó `shopId` sẽ được lưu là `null`.

```json
{
  "shopId": 1,
  "productIds": [1, 2],
  "categoryIds": [1],
  "name": "Summer Sale",
  "value": 10,
  "maxDiscountValue": 50000,
  "type": "PERCENTAGE",
  "scope": "SHOP",
  "code": "SUMMER10",
  "description": "10% off for summer, max 50K",
  "maxTotalUses": 100,
  "applyTo": "ALL",
  "maxUsesPerUser": 1,
  "minOrderValue": 100000,
  "isActive": true,
  "startDate": "2023-11-01T00:00:00.000Z",
  "endDate": "2023-11-30T23:59:59.000Z"
}
```

**Các loại discount (`type`):**

| Type            | Mô tả                        | Ví dụ                                                                                                      |
| --------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `PERCENTAGE`    | Giảm theo % giá trị đơn hàng | `value: 10` → giảm 10%, `maxDiscountValue: 50000` → tối đa 50K                                             |
| `FIXED_AMOUNT`  | Giảm số tiền cố định         | `value: 50000` → giảm 50K                                                                                  |
| `COIN_CASHBACK` | Giảm số tiền cố định dạng xu | `value: 20000` → trừ 20K vào tổng giảm của đơn                                                             |
| `SHIPPING`      | Giảm/miễn phí vận chuyển     | `value: 100` → miễn phí ship, `value: 50` → giảm 50% ship, `maxDiscountValue: 30000` → freeship tối đa 30K |

**Các scope:**

| Scope      | Mô tả                                                  |
| ---------- | ------------------------------------------------------ |
| `SHOP`     | Voucher của shop, chỉ áp dụng cho đơn hàng của shop đó |
| `PLATFORM` | Voucher sàn, áp dụng cho toàn bộ đơn hàng              |

**Các applyTo:**

| ApplyTo    | Mô tả                                                                       |
| ---------- | --------------------------------------------------------------------------- |
| `ALL`      | Áp dụng cho toàn bộ sản phẩm trong đơn                                      |
| `SPECIFIC` | Chỉ áp dụng cho sản phẩm/danh mục cụ thể (theo `productIds`, `categoryIds`) |

**Lưu ý về `maxDiscountValue`:**

- Dùng để giới hạn số tiền giảm tối đa cho voucher `PERCENTAGE` và `SHIPPING`
- Ví dụ: "Giảm 50%, tối đa 100K" → `value: 50`, `maxDiscountValue: 100000`
- Ví dụ: "Freeship tối đa 30K" → `type: SHIPPING`, `value: 100`, `maxDiscountValue: 30000`
- Nếu `maxDiscountValue` = 0 hoặc null → không giới hạn

### Update Discount (Admin, Seller)

**PUT** `/discount/:discountId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Lưu ý quan trọng về Quyền:**

- Tương tự như tạo mới, tuỳ thuộc vào Role gọi API và `scope` của mã giảm giá mà Backend sẽ ràng buộc bảo mật: Seller chỉ cập nhật được mã của Shop mình, Admin cập nhật được mã toàn sàn (`PLATFORM`). Logic kiểm tra sản phẩm cũng được thực thi bảo chứng.

```json
{
  "name": "Summer Sale Updated",
  "value": 15
}
```

### Delete Discount (Admin, Seller)

**DELETE** `/discount/:discountId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Lưu ý quan trọng về Quyền:**

- **Seller:** Chỉ có thể xoá mã giảm giá mà `scope='SHOP'` và `shopId` trùng với cửa hàng của chính mình.
- **Admin:** Được phép xoá mã giảm giá thuộc quyền sàn `scope='PLATFORM'`.

### Save Voucher (User)

**POST** `/discount/:discountId/save`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

**Mô tả:** User lưu voucher vào "Kho voucher" của mình để sử dụng sau. Voucher đã lưu có thể xem qua `GET /discount/my-vouchers`.

**Lưu ý:**

- Chỉ lưu được voucher đang active và chưa hết hạn
- Gọi lại endpoint này nếu đã lưu rồi → trả về kết quả cũ (idempotent), không báo lỗi
- Khi user dùng voucher đặt hàng → hệ thống tự động tăng biến đếm, CHỈ đánh dấu `isUsed = true` (biến mất khỏi ví) khi người dùng vắt kiệt số lượt cho phép (`maxUsesPerUser`).
- Khi user hủy đơn → hệ thống tự động hoàn lại số lượt đã dùng và reset `isUsed = false`, user có thể dùng lại

### Preview Discount

**POST** `/discount/preview`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "code": "SUMMER10",
  "orderValue": 200000,
  "shippingFee": 30000,
  "userId": 1,
  "shopId": 1,
  "items": [
    {
      "productId": 1,
      "categoryId": 1,
      "price": 100000,
      "quantity": 2
    }
  ]
}
```

**Response (voucher giảm giá):**

```json
{
  "isValid": true,
  "discountAmount": 20000,
  "shippingDiscount": 0,
  "finalPrice": 180000,
  "finalShippingFee": 30000,
  "message": "Áp dụng mã thành công"
}
```

**Response (voucher freeship):**

```json
{
  "isValid": true,
  "discountAmount": 0,
  "shippingDiscount": 30000,
  "finalPrice": 200000,
  "finalShippingFee": 0,
  "message": "Áp dụng mã freeship thành công"
}
```

**Lưu ý:**

- `orderValue` là field bắt buộc theo request schema, nhưng backend sẽ tính lại từ `items` để đảm bảo an toàn
- `shippingFee`: Phí vận chuyển của đơn hàng (bắt buộc khi preview voucher `SHIPPING`)
- `discountAmount`: Số tiền giảm trên giá sản phẩm (= 0 nếu là voucher freeship)
- `shippingDiscount`: Số tiền giảm trên phí ship (= 0 nếu không phải voucher freeship)
- `finalPrice`: Giá sản phẩm sau khi giảm
- `finalShippingFee`: Phí ship sau khi giảm

---

## Review Module

### List Reviews

**GET** `/review/product/:productId?page=1&limit=10`

_No Auth Headers_

### Create Review

**POST** `/review`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "content": "Great product!",
  "rating": 5,
  "orderId": 1,
  "productId": 1,
  "medias": [
    {
      "url": "https://example.com/review.jpg",
      "type": "IMAGE" // IMAGE, VIDEO
    }
  ]
}
```

### Update Review

**PUT** `/review/:reviewId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "content": "Updated review content",
  "rating": 4
}
```

---

## Shop Video Module

### List Shop Videos

**GET** `/shop-video?page=1&limit=10`

_No Auth Headers_ (Public)

**Query Params:**

- `page`: number (default 1)
- `limit`: number (default 10)
- `shopId`: number (optional)

**Response Note:**
Dữ liệu trả về ở mảng `products` bên trong mỗi video sẽ bao gồm cờ `has_variants: boolean`. Dựa vào cờ này FE quyết định nút bấm là "Thêm vào giỏ" hay "Chọn loại". Mảng `skus` đã được ẩn đi để tối ưu băng thông.

### Get Shop Video Detail

**GET** `/shop-video/:id`

_No Auth Headers_ (Public, but optimal if authenticated — returns whether current user has liked the video)

**Response Note:**
Tương tự danh sách, dữ liệu trả về ở mảng `products` bên trong video sẽ bao gồm cờ `has_variants: boolean`.

### Create Shop Video

**POST** `/shop-video`

**Headers**

- `Authorization`: `Bearer <accessToken>`
- `Content-Type`: `multipart/form-data`

_Form Data:_

- `video`: (Binary File) — **Bắt buộc**. File video (MP4, WebM, QuickTime, AVI, MKV). Max 100MB.
- `caption`: (String, optional) — Mô tả video, tối đa 2000 ký tự.
- `thumbnailUrl`: (String, optional) — URL thumbnail (upload ảnh trước qua `POST /media/images/upload`).
- `productIds`: (String, optional) — JSON array các product ID liên kết. Ví dụ: `[1, 2, 3]`

**Lưu ý:** Seller chỉ cần tải video lên, hệ thống tự động upload lên Cloudinary và tạo record.

**Response:**

```json
{
  "id": 1,
  "caption": "Video caption",
  "videoUrl": "https://res.cloudinary.com/xxx/video/upload/v.../videos/video123.mp4",
  "thumbnailUrl": "https://example.com/thumb.jpg",
  "status": "ACTIVE",
  "shopId": 1,
  "products": [...],
  "shop": { "id": 1, "name": "Shop Name", "avatar": "..." }
}
```

````

### Update Shop Video

**PUT** `/shop-video/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "caption": "Updated caption",
  "status": "ACTIVE", // ACTIVE, INACTIVE
  "thumbnailUrl": "https://example.com/new-thumb.jpg",
  "productIds": [1, 3]
}
````

### Delete Shop Video

**DELETE** `/shop-video/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

### Toggle Like

**POST** `/shop-video/:id/like`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Add Comment

**POST** `/shop-video/:id/comments`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "content": "Nice video!",
  "parentId": 1 // Optional — for reply to another comment
}
```

### Get Comments

**GET** `/shop-video/:id/comments?page=1&limit=20`

_No Auth Headers_ (Public)

---

## Message Module

### Send Message

**POST** `/messages`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "receiverId": 2,
  "content": "Hello",
  "type": "TEXT"
}
```

### Get Conversations

**GET** `/messages/conversations`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Get Messages in Conversation

**GET** `/messages/conversations/:conversationId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### WebSocket Connection

**Namespace/Path**: `/` (Default WebSocket Server)

**Connection payload/headers**:
Provide `Authorization: Bearer <accessToken>` in headers or query param `?token=<accessToken>`

**Events**: Real-time events will be pushed to the client via `user_${userId}` room mapping natively.

---

## Address Module

### List Addresses

**GET** `/address`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Get Address Detail

**GET** `/address/:addressId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

### Create Address

**POST** `/address`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "John Doe",
  "phone": "0123456789",
  "address": "123 Main St, District 1, Ho Chi Minh City",
  "isDefault": true // Optional, default: false. First address is automatically set as default.
}
```

### Update Address

**PUT** `/address/:addressId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Jane Doe", // Optional
  "phone": "0987654321", // Optional
  "address": "456 Second St, District 2, Ho Chi Minh City", // Optional
  "isDefault": true // Optional
}
```

### Delete Address

**DELETE** `/address/:addressId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

**Note:** If the deleted address was the default, the most recently created address will be automatically set as the new default.

### Set Default Address

**PUT** `/address/:addressId/default`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Shop Module (Multi-vendor)

### Register Shop

**POST** `/shop/register`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "My Awesome Shop",
  "description": "Chuyên bán đồ công nghệ", // Optional
  "phoneNumber": "0987654321", // Optional
  "address": "123 Đường Công Nghệ, Quận 1, TP.HCM", // Optional
  "email": "shop@example.com" // Optional
}
```

### Get My Shop Info

**GET** `/shop/my-shop`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

**Response:**
Trả về thông tin cửa hàng hiện tại của user đang đăng nhập. Nếu chưa tạo, trả về `null`. Nếu đã tạo, kèm theo field `status` (`PENDING`, `APPROVED`, `REJECTED`) để frontend render giao diện tương ứng.

### Get Shop Statistics

**GET** `/shop/statistics`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Response:**
Trả về thống kê đơn hàng và doanh thu của cửa hàng trong ngày hôm nay và trong tháng hiện tại.

```json
{
  "today": {
    "totalOrders": 15,
    "totalRevenue": 2500000
  },
  "thisMonth": {
    "totalOrders": 120,
    "totalRevenue": 24500000
  }
}
```

---

## Notification Module

### List Notifications

**GET** `/notifications?page=1&limit=10&isRead=false`

**Headers**

- `Authorization`: `Bearer <accessToken>`

**Query Params:**

- `page`: number (default 1)
- `limit`: number (default 10)
- `isRead`: boolean (optional) - Lọc danh sách thông báo đã đọc hay chưa đọc

### Mark All As Read

**PATCH** `/notifications/read-all`

**Headers**

- `Authorization`: `Bearer <accessToken>`

### Mark specific Notification As Read

**PATCH** `/notifications/:notificationId/read`

**Headers**

- `Authorization`: `Bearer <accessToken>`
