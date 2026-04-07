# Hướng Dẫn Tích Hợp API (Frontend Integration Guide)

Tài liệu này cung cấp các quy chuẩn và hướng dẫn để đội Frontend tích hợp với hệ thống API backend một cách hiệu quả và mượt mà nhất.

## 1. Cấu Hình Chung

- **Base URL (Dev):** `http://localhost:9999` (Cho các API chung)
- **Base URL (Nhận Webhook từ ngoài/Test thực tế với 3rd party):** `https://guardlike-danica-unguileful.ngrok-free.app`
- **Prefix:** Hiện tại API không sử dụng prefix global (ví dụ `/api/v1`), các endpoint bắt đầu trực tiếp từ root (ví dụ `/auth/login`).
- **Thời gian:** Toàn bộ thời gian (datetime) trao đổi nên sử dụng format ISO 8601 UTC (ví dụ: `2023-10-27T10:00:00Z`).

## 2. Headers & Request Format

Hầu hết các request (trừ upload file) đều sử dụng format JSON.

- **Content-Type:** `application/json`
- **Accept-Language:** `vi` hoặc `en` (để nhận thông báo lỗi/dữ liệu theo ngôn ngữ tương ứng).

## 3. Xác Thực (Authentication) & Phân Quyền (Authorization)

Hệ thống sử dụng cơ chế **JWT (JSON Web Token)**.

### a. Luồng Đăng Nhập (Login Flow)

1.  Gọi API **Login** (`POST /auth/login`).
2.  Server trả về `accessToken` và `refreshToken`.
3.  Lưu `accessToken` vào memory (trong state management) hoặc Cookie httpOnly (tùy chiến lược bảo mật).
4.  Lưu `refreshToken` (thường là để duy trì phiên đăng nhập lâu dài).

### b. Gửi Request Có Xác Thực

Gửi kèm `accessToken` trong header `Authorization` của mọi request cần bảo mật:

```http
Authorization: Bearer <your_access_token>
```

### c. Xử Lý Khi Token Hết Hạn (401 Unauthorized)

Khi gọi API nhận được lỗi **401**, Frontend cần thực hiện cơ chế **Auto Refresh Token**:

1.  Interceptor của Axios/Fetch bắt được lỗi 401.
2.  Gọi API **Refresh Token** (`POST /auth/refresh-token`) gửi kèm `refreshToken` hiện có.
3.  Nếu thành công:
    - Nhận `accessToken` mới.
    - Lưu lại token mới.
    - Thực hiện lại (retry) request vừa bị lỗi 401 ban đầu.
4.  Nếu thất bại (Refresh token cũng hết hạn/không hợp lệ):
    - Logout người dùng.
    - Chuyển hướng về trang Login.

### d. Xử Lý Khi Không Có Quyền (403 Forbidden)

- API trả về **403** (thường kèm message `Error.Forbidden`) khi user đã đăng nhập nhưng **Role** hiện tại không có quyền truy cập vào endpoint đó.
- Hệ thống backend kiểm tra quyền dựa trên **Path** và **Method** của API.
- **Frontend:** Hiển thị thông báo "Bạn không có quyền thực hiện thao tác này" hoặc ẩn các nút bấm chức năng tương ứng với role của user.

### e. Luồng OTP (OTP Flow)

Đối với các chức năng yêu cầu OTP (Register, Forgot Password), quy trình chuẩn như sau:

1.  **Gửi OTP:** Gọi API **Send OTP** (`POST /auth/otp`) với email và loại hành động (`type`).
2.  **Xác Thực OTP (Optional):** Gọi API **Verify OTP** (`POST /auth/verify-otp`) ngay khi user nhập xong mã để kiểm tra tính hợp lệ trước khi cho phép submit form chính. Điều này giúp cải thiện UX (báo lỗi sớm).
3.  **Submit Action:** Gọi API chính (Register, Forgot Password,...) gửi kèm mã `code` đã verify.

## 4. Đa Ngôn Ngữ (Internationalization - i18n)

Để nhận dữ liệu hoặc thông báo lỗi theo ngôn ngữ mong muốn (Ví dụ: `name` của Product, Category Translation), Frontend có 2 cách truyền:

1.  **Query Parameter (Ưu tiên cao nhất):**
    Thêm `?lang=vi` hoặc `?lang=en` vào URL.
    Ví dụ: `GET /product?lang=vi`

2.  **Header:**
    Gửi header `Accept-Language: vi`.

_Khuyên dùng: Thiết lập Header `Accept-Language` global trong axios instance dựa trên setting ngôn ngữ của user._

## 5. Định Dạng Phản Hồi (Response Format)

### a. Phản Hồi Thành Công (Success)

Dữ liệu thường được trả về trực tiếp hoặc trong object tùy endpoint.
Ví dụ danh sách có phân trang:

```json
// GET /user
[
  { "id": 1, "name": "User A", ... },
  { "id": 2, "name": "User B", ... }
]
// Hoặc nếu có metadata phân trang (tùy implement cụ thể từng API)
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

_Lưu ý: Kiểm tra kỹ Swagger/API List cho từng endpoint cụ thể._

### b. Phản Hồi Lỗi (Error)

Hệ thống sử dụng Filter Exception chuẩn của NestJS.
Cấu trúc lỗi trả về:

```json
{
  "statusCode": 400,
  "message": "Error description or generic message",
  "error": "Bad Request"
}
```

- **Validation Error (Zod/Pipe):**
  Nếu lỗi do dữ liệu đầu vào không hợp lệ (400), `message` có thể là một chuỗi mô tả lỗi chi tiết.

- **Business Error:**
  `message` thường là một mã lỗi (error code) dạng string, ví dụ `Error.UserNotFound`, `Error.EmailAlreadyExists`. Frontend nên dựa vào mã này để map ra text hiển thị đa ngôn ngữ trên giao diện.

## 6. Upload File (Media)

Toàn bộ file được lưu trữ trên **Cloudinary** (thay thế AWS S3). URL trả về sẽ có dạng `https://res.cloudinary.com/...`.

### a. Upload Ảnh (Images)

Khi upload ảnh để sử dụng trong Product, Brand, SKU,...:

1. **Upload ảnh lên server** bằng API `POST /media/images/upload`:
   - Header **BẮT BUỘC**: `Content-Type: multipart/form-data`
   - Hỗ trợ format: JPEG, JPG, PNG, WebP. Max **5MB/file**.
   - Body gửi dạng `FormData`:
     ```javascript
     const formData = new FormData()
     formData.append('file', fileObject1)
     formData.append('file', fileObject2) // Có thể upload nhiều file cùng lúc
     ```

2. **Response từ API upload** sẽ có dạng:

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

3. **Lấy URL từ response để sử dụng:**
   - **❌ SAI**: Không stringify toàn bộ object hoặc stringify từng item
   - **✅ ĐÚNG**: Chỉ lấy field `url` từ mỗi item trong array `data`

   ```javascript
   // ❌ SAI - Đừng làm như thế này
   const wrongImages = response.data.map((item) => JSON.stringify(item))

   // ✅ ĐÚNG - Làm như thế này
   const correctImages = response.data.map((item) => item.url)
   // Result: ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."]
   ```

4. **Sử dụng URLs khi tạo/cập nhật Product**:
   ```json
   {
     "name": "Áo thun",
     "images": [
       "https://res.cloudinary.com/xxx/image/upload/v.../images/abc123.png",
       "https://res.cloudinary.com/xxx/image/upload/v.../images/def456.png"
     ]
   }
   ```

### b. Upload Video

Khi cần upload video riêng lẻ (không qua Shop Video module):

1. **Upload video lên server** bằng API `POST /media/videos/upload`:
   - Header **BẮT BUỘC**: `Content-Type: multipart/form-data`
   - Hỗ trợ format: MP4, WebM, QuickTime, AVI, MKV. Max **100MB/file**. Tối đa **10 file**.
   - Body gửi dạng `FormData`:
     ```javascript
     const formData = new FormData()
     formData.append('file', videoFile)
     ```

2. **Response** cùng format với upload ảnh:
   ```json
   {
     "data": [
       {
         "url": "https://res.cloudinary.com/xxx/video/upload/v.../videos/video123.mp4",
         "name": "my-video.mp4",
         "key": "videos/video123",
         "type": "video/mp4"
       }
     ]
   }
   ```

### c. Lưu Ý Quan Trọng

- Field `images` trong Product/SKU **PHẢI** là **array of string URLs**, KHÔNG phải object hay stringified object
- URL trả về từ Cloudinary đã có dạng HTTPS, có thể sử dụng trực tiếp
- Tương tự áp dụng cho field `image` trong SKU (chỉ gửi URL string, không phải object)

## 7. Các Lưu Ý Khác

- **Role & Permission:** Hệ thống backend cache quyền của user. Nếu admin thay đổi quyền của role, changes có thể mất một khoảng thời gian (TTL cache) để update hoặc user cần relogin.
- **Socket:** Kết nối WebSocket cần thiết lập qua Adapter, đảm bảo truyền token xác thực nếu socket yêu cầu bảo mật.

## 8. Rate Limiting (Giới Hạn Request)

Hệ thống có cơ chế giới hạn số lượng request để chống spam/DDoS.

- **Giới hạn hiện tại:** 10 requests / 60 giây (Global).
- **Phản hồi khi vượt quá:** HTTP Status **429 Too Many Requests**.
- **Lưu ý:** Nếu Frontend gặp lỗi này thường xuyên trong quá trình phát triển/testing, hãy liên hệ Backend để điều chỉnh cấu hình Throttler.

## 9. Tích Hợp Real-time Chat (Message Module)

Hệ thống cung cấp tính năng nhắn tin theo thời gian thực (real-time chat) thông qua **WebSocket (Socket.IO)** và **REST API**.

### a. Lấy dữ liệu ban đầu qua REST API

- **Danh sách hội thoại:** Trình bày danh sách người dùng đã chat thông qua `GET /messages/conversations`. Trả về những người dùng cùng với thông tin tin nhắn mới nhất.
- **Chi tiết tin nhắn:** Khi bấm vào 1 đoạn hội thoại, load lịch sử bằng API `GET /messages/conversations/:conversationId`. (Hỗ trợ phân trang nếu cần thiết theo design).

### b. Kết nối WebSocket

Kết nối tới socket server với path `/` theo mặc định của NestJS WebSocket Gateway.
**Quan trọng:** Phải truyền kèm xác thực `accessToken` để được kết nối.

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:9999', {
  extraHeaders: {
    Authorization: `Bearer ${accessToken}`, // Gửi qua Header (ưu tiên)
  },
  query: {
    token: accessToken, // Hoặc gửi qua Query param
  },
})

socket.on('connect', () => {
  console.log('Connected to Real-time Chat!')
})

socket.on('disconnect', () => {
  console.log('Disconnected from Real-time Chat!')
})
```

### c. Lắng nghe tin nhắn mới

Hệ thống bắn event trực tiếp tới `user_${userId}`, bạn cần lắng nghe sự kiện message từ backend trả về. Ví dụ: `receiveMessage` hoặc tên event tương ứng của backend quy định (hiện tại logic backend push event cần thống nhất tên event).

### d. Gửi tin nhắn

- Gửi tin nhắn gọi REST API `POST /messages` với `receiverId` và `content`.
- Khi API xử lý xong, hệ thống qua WebSocket tự động push về người nhận (hoặc bạn có thể tự cập nhật UI optimistic trên thiết bị người gửi trước).

## 10. Tích Hợp Shop Video Module (TikTok/Reels format)

Chức năng lướt xem video giới thiệu sản phẩm của Shop tương tự như các nền tảng video ngắn.

### a. Tạo Video (Seller)

Seller chỉ cần upload file video, hệ thống tự động xử lý mọi thứ:

```javascript
const formData = new FormData()
formData.append('video', videoFile) // Bắt buộc — file video (MP4, WebM, QuickTime, AVI, MKV). Max 100MB
formData.append('caption', 'Mô tả video') // Optional
formData.append('thumbnailUrl', 'https://...') // Optional — URL thumbnail (upload trước qua POST /media/images/upload)
formData.append('productIds', JSON.stringify([1, 2, 3])) // Optional — JSON array product IDs

const response = await fetch('/shop-video', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    // KHÔNG set Content-Type, browser tự set multipart/form-data
  },
  body: formData,
})
```

**Flow tạo video hoàn chỉnh:**

1. (Optional) Upload thumbnail trước: `POST /media/images/upload` → lấy `url`
2. Gọi `POST /shop-video` với `multipart/form-data` gửi file video + metadata
3. Hệ thống tự upload video lên Cloudinary → tạo record DB → trả kết quả

> **Lưu ý:** Không cần upload video riêng rồi truyền URL. Chỉ cần gửi file trực tiếp, hệ thống lo phần còn lại.

### b. Lấy danh sách Video

- Gọi `GET /shop-video?page=1&limit=10` (có thể lọc theo `shopId`).
- Hiển thị UI theo dạng cuộn trang (swiping up/down) hoặc carousel dọc. Dữ liệu trả về sẽ bao gồm URL video (`videoUrl`) và các thông số tương tác (like, cmt).
- **Lưu ý về Sản phẩm đính kèm:** Mảng `products` trả về chỉ cung cấp thông tin tinh gọn, kèm theo cờ `has_variants` (Boolean).
  - Nếu `has_variants == false`: FE giữ nguyên nút "Thêm vào giỏ" để gọi API mua luôn với giá mặc định.
  - Nếu `has_variants == true`: FE đổi nút bấm thành "Chọn loại". Khi người dùng nhấn vào, FE bật Bottom Sheet lên (đồng thời xoay spinner) và gọi nhanh API `GET /product/:productId/variants`. Quá trình gọi API này mất ~100-200ms, ăn khớp với hiệu ứng Bottom Sheet. Khi có data thì render các nút bấm (Màu Đỏ, Size L,...) để user chọn. Mảng `skus` mặc định ở API danh sách đã bị ẩn để tối ưu băng thông.

### c. Xử lý Tương Tác

1. **Thích (Like):**
   - Nút thả tim gọi API `POST /shop-video/:id/like`.
   - UI nên là **Optimistic Update**: Ngay khi click thì UI chuyển tim đỏ liền + tăng số đếm (dù API chưa trả về xong) để cho người xem cảm giác thao tác cực nhanh.
2. **Bình luận (Comments):**
   - Lấy danh sách bình luận (Public - không cần đăng nhập vẫn xem được): `GET /shop-video/:id/comments` (Có phân trang).
   - Thêm bình luận (Cần đăng nhập): `POST /shop-video/:id/comments`.
   - Hỗ trợ trả lời bình luận (reply): gửi kèm `parentId` để reply một comment cụ thể.

## 11. Tích Hợp Address Module (Quản lý Địa chỉ)

Người dùng có thể lưu nhiều địa chỉ giao hàng và chọn một địa chỉ mặc định.

### a. Quản lý Địa chỉ

- **Danh sách:** `GET /address` — trả về tất cả địa chỉ của user, sắp xếp theo mặc định trước.
- **Thêm mới:** `POST /address` với `name`, `phone`, `address`, `isDefault` (optional). Địa chỉ đầu tiên tự động trở thành mặc định.
- **Cập nhật:** `PUT /address/:addressId` — partial update (chỉ truyền field cần sửa).
- **Xóa:** `DELETE /address/:addressId` — nếu xóa địa chỉ mặc định, hệ thống tự động chọn địa chỉ mới nhất còn lại làm mặc định.
- **Đặt mặc định:** `PUT /address/:addressId/default`.

### b. Sử dụng Địa chỉ khi Đặt hàng

Khi tạo đơn hàng (`POST /order`), bạn có thể:

1. **Truyền `receiver` trực tiếp** — phù hợp khi user nhập tay:
   ```json
   {
     "shopId": 1,
     "shippingFee": 30000,
     "receiver": { "name": "...", "phone": "...", "address": "..." },
     "cartItemIds": [1]
   }
   ```
2. **Truyền `userAddressId`** — sử dụng địa chỉ đã lưu:
   ```json
   { "shopId": 1, "shippingFee": 30000, "userAddressId": 1, "cartItemIds": [1] }
   ```

_Chỉ cần truyền một trong hai (`receiver` hoặc `userAddressId`). Có thể kèm `shopDiscountCode` / `platformDiscountCode` để áp dụng voucher (xem mục 14)._

_`shippingFee` có thể bỏ qua (backend mặc định `0`), nhưng nên truyền giá trị thực tế để voucher freeship (`SHIPPING`) tính chính xác._

## 12. Tìm Kiếm Sản Phẩm

- Gọi `GET /product/search?q=keyword&page=1&limit=10&sortBy=price&orderBy=asc` để tìm sản phẩm theo từ khóa.
- Tham số `q` là bắt buộc.
- Endpoint này tách biệt với `GET /product` (list with filters). Phù hợp cho tính năng Search và hiển thị kết quả tìm kiếm với các tùy chọn sắp xếp:
  - `sortBy`: "price" (Giá), "createdAt" (Mới nhất), "sale" (Bán chạy). Mặc định là "createdAt".
  - `orderBy`: "asc" (Tăng dần), "desc" (Giảm dần). Mặc định là "desc".

## 13. Tích Hợp Thanh Toán SePay (QR Code Transfer)

Hệ thống sử dụng **SePay** để nhận thanh toán qua chuyển khoản ngân hàng. Backend xử lý xác nhận tự động qua Webhook.

### a. Luồng Thanh Toán Tổng Quan

```
User đặt hàng:
1. GET /payment/config → Lấy thông tin bank (accountNumber, bankCode, prefix)
2. POST /order → Nhận paymentId
→ Frontend gen QR từ config + paymentId
→ Hiển thị màn hình QR Code
→ User chuyển khoản với nội dung {prefix}{paymentId}
→ SePay detect → Gọi webhook → Backend xác nhận
→ WebSocket emit "payment" event → Frontend cập nhật UI
```

### b. Lấy Thông Tin Ngân Hàng

Gọi API `GET /payment/config` (Public, không cần auth) để lấy thông tin tài khoản nhận tiền:

```json
{
  "accountNumber": "0123456789",
  "bankCode": "VCB",
  "prefix": "PM"
}
```

> **Khuyến nghị & Tối ưu UX:** Tốt nhất nên gọi API này một lần lúc khởi tạo app (Lưu vào Redux/Zustand) hoặc ngay khi user truy cập vào trang `CheckoutPage`, tránh việc đợi user bấm "Đặt hàng" mới gọi — giúp việc hiển thị mã QR ngay lập tức sau khi tạo Order mà không có độ trễ gọi API lần 2.

### c. Tạo QR Code Thanh Toán

Sau khi gọi `POST /order` thành công, response trả về:

```json
{
  "orders": [...],
  "paymentId": 123
}
```

**Frontend tự gen mã QR** bằng URL của SePay, kết hợp thông tin từ `GET /payment/config`:

```javascript
// Lấy config
const config = await fetch('/payment/config').then(r => r.json())

// Sau khi tạo order
const order = await fetch('/order', { method: 'POST', ... }).then(r => r.json())

// Gen QR URL
const qrUrl = `https://qr.sepay.vn/img?acc=${config.accountNumber}&bank=${config.bankCode}&amount=${totalAmount}&des=${config.prefix}${order.paymentId}`
```

**Các tham số:**

| Tham số  | Mô tả                            | Nguồn                                   |
| -------- | -------------------------------- | --------------------------------------- |
| `acc`    | Số tài khoản ngân hàng nhận tiền | `GET /payment/config` → `accountNumber` |
| `bank`   | Mã ngân hàng (VCB, MB, ACB,...)  | `GET /payment/config` → `bankCode`      |
| `amount` | Tổng tiền thanh toán             | Tính từ danh sách items trong order     |
| `des`    | Nội dung chuyển khoản            | `{prefix}{paymentId}` (ví dụ `PM123`)   |

> **⚠️ QUAN TRỌNG:** Nội dung chuyển khoản (`des`) **PHẢI** theo đúng format `{prefix}{paymentId}` (ví dụ `PM123`). Backend dùng prefix này để trích xuất `paymentId` và xác nhận thanh toán. Sai format sẽ khiến thanh toán không được nhận diện.

### d. Hiển thị Màn Hình QR Code

**Flow UI/UX khuyến nghị:**

1. User chọn phương thức thanh toán **"Chuyển khoản ngân hàng"** trên CheckoutPage
2. Bấm **"Đặt hàng"** → Gọi `POST /order`
3. Sau khi API trả về thành công → **Điều hướng sang màn hình QR Code riêng biệt** với:
   - **Mã QR:** (gen từ URL SePay) đặt ở chính giữa.
   - **Thông tin chuyển khoản:** Hiển thị Ngân hàng, STK, Số tiền, Nội dung CK. **Nên có nút "Sao chép" (Copy)** ở STK và Nội dung CK để user tiện copy bằng tay.
   - **Loading Spinner:** Có hiệu ứng loading với text "Đang chờ thanh toán..." để user biết luồng đang chạy ngầm.
   - **Nút "Tôi đã thanh toán":** Hiển thị thêm một nút bấm phụ để user có thể chủ động xác minh phòng trường hợp mạng hoặc Socket bị trễ.
   - **Bộ đếm ngược 24h:** Hiển thị rõ thời gian còn lại (thời gian chờ thanh toán trước khi đơn bị tự động hủy).
4. Khi WebSocket nhận event `payment` → Cập nhật UI thành **"Thanh toán thành công! ✅"** → Dừng spinner và cho phép (hoặc tự động) điều hướng về trang Đơn hàng của tôi sau 2-3s.

### e. Lắng Nghe Thanh Toán Real-time (WebSocket)

Kết nối vào **namespace `payment`** để nhận thông báo thanh toán:

```javascript
import { io } from 'socket.io-client'

const paymentSocket = io('http://localhost:9999/payment', {
  extraHeaders: {
    Authorization: `Bearer ${accessToken}`,
  },
})

paymentSocket.on('payment', (data) => {
  // data format thường gồm: { status: 'success', paymentId: 123 }
  if (data.status === 'success') {
    // 1. Dừng spinner loading
    // 2. Hiển thị thông báo "Thanh toán thành công" (Tick xanh)
    // 3. (Optional) Tự động điều hướng user về trang đơn hàng
  }
})
```

> **Lưu ý:** Namespace thanh toán là `/payment`, tách biệt với namespace chat mặc định.

### f. Tính Năng Chủ Động Xác Minh (Fallback Checking)

Do đặc thù một số trường hợp (Emulator, FE chạy local không có Ngrok để nhận Webhook, rớt kết nối mạng hoặc Socket chập chờn), nếu chỉ để App bị động chờ Socket thì sẽ gặp rủi ro user đã chuyển khoản nhưng bị kẹt ở màn hình loading. Vì vậy, FE cần bổ sung nút **"Tôi đã thanh toán"** phía dưới mã QR.

**Luồng hoạt động khi nhấn "Tôi đã thanh toán":**

1. FE gọi API kiểm tra trạng thái thanh toán hiện tại (`GET /payment/:paymentId/status`).
2. API sẽ trả về field `status` của payment đó (`PENDING` | `SUCCESS` | `FAILED`).
3. **Thành công (Backend đã nhận tiền nhưng Socket trễ/lỗi):** Nếu `status` là `SUCCESS`, FE chủ động dừng spinner, làm mới UI thông báo "Thanh toán thành công! ✅" ngay cho người dùng mà không cần chờ Socket.
4. **Đang xử lý (SePay/Bank chưa xử lý xong):** Nếu `status` vẫn là `PENDING`, FE hiển thị Toast nhẹ nhàng `"Hệ thống đang kiểm tra giao dịch, vui lòng chờ trong giây lát..."` và tiếp tục giữ màn hình QR/Spinner.

### g. Xử Lý Timeout & Hủy Đơn

- **Hủy bằng Job tự động:** Backend tự động **hủy đơn hàng sau 24 giờ** nếu chưa thanh toán (sử dụng BullMQ job queue).
- **Trạng thái Hủy:** Khi đơn bị hủy: Payment → `FAILED`, Orders → `CANCELLED`, stock được hoàn lại.
- **Xử lý UI khi bị hủy:** Giao diện nên hiển thị bộ đếm ngược. Nếu người dùng F5 / reload page, Frontend cần lấy thông tin Order để kiểm tra trạng thái. Nếu trạng thái là `CANCELLED`, cần thay thế QR Code bằng thông báo tĩnh: "Đơn hàng đã hết hạn thanh toán".
- **Hủy chủ động (User):** User có thể chủ động hủy bằng cách nhấn nút trên UI, gọi API `PUT /order/:orderId` với status huỷ.
- **Hoàn voucher:** Khi đơn bị hủy (cả thủ công lẫn quá hạn), hệ thống tự động hoàn lại voucher đã sử dụng — user có thể dùng lại voucher cho đơn hàng khác. Frontend không cần xử lý thêm bước này.

---

_Tài liệu này được dùng kèm với `API_LIST.md` để tra cứu chi tiết từng endpoint._

## 14. Hệ Thống Voucher & Discount

Hệ thống hỗ trợ nhiều loại voucher tương tự Shopee/Tiki, bao gồm: lưu voucher, preview, áp dụng khi đặt hàng, và tự động hoàn trả khi hủy đơn.

### a. Các Loại Voucher

| Type            | Mô tả                | Cách tính                                                                              |
| --------------- | -------------------- | -------------------------------------------------------------------------------------- |
| `PERCENTAGE`    | Giảm % giá trị đơn   | `discountAmount = orderValue * value / 100`, tối đa `maxDiscountValue`                 |
| `FIXED_AMOUNT`  | Giảm số tiền cố định | `discountAmount = value`                                                               |
| `COIN_CASHBACK` | Giảm số tiền cố định | `discountAmount = value` (được xử lý như giảm tiền trực tiếp trên đơn)                 |
| `SHIPPING`      | Giảm/miễn phí ship   | `value >= 100` → miễn phí ship, `value < 100` → giảm % ship, tối đa `maxDiscountValue` |

### b. Xếp Chồng Voucher (Stacking)

- ✅ **1 Voucher Shop + 1 Voucher Sàn** → Được áp dụng cùng lúc
- ❌ Không được dùng 2 voucher Shop hoặc 2 voucher Sàn cùng lúc
- ✅ **Voucher Freeship** có thể dùng kết hợp với voucher giảm giá

### c. Lưu Voucher (Save)

User có thể "bấm lưu" voucher vào kho voucher cá nhân để dùng sau:

```javascript
// Lưu voucher
await fetch('/discount/5/save', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
})

// Xem kho voucher đã lưu
const myVouchers = await fetch('/discount/my-vouchers?page=1&limit=10', {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json())
```

**Lưu ý:**

- Chỉ lưu được voucher đang active và chưa hết hạn
- Gọi lưu lại voucher đã lưu rồi → trả về kết quả cũ (idempotent), không lỗi
- `GET /discount/my-vouchers` chỉ trả về voucher chưa dùng hoặc chưa quá số lượt (`isUsed = false`), còn hiệu lực

### d. Preview Voucher Trước Khi Đặt Hàng

Gọi `POST /discount/preview` để kiểm tra tính hợp lệ và xem trước số tiền giảm:

```javascript
const result = await fetch('/discount/preview', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({
    code: 'SUMMER10',
    orderValue: 200000,
    shippingFee: 30000, // Phí ship (bắt buộc nếu dùng voucher SHIPPING)
    userId: 1,
    shopId: 1,
    items: [{ productId: 1, categoryId: 1, price: 100000, quantity: 2 }],
  }),
}).then((r) => r.json())

// Response:
// {
//   isValid: true,
//   discountAmount: 20000,       // Giảm trên giá sản phẩm
//   shippingDiscount: 0,         // Giảm trên phí ship (> 0 nếu SHIPPING voucher)
//   finalPrice: 180000,          // Giá sau giảm
//   finalShippingFee: 30000,     // Phí ship sau giảm
//   message: 'Áp dụng mã thành công'
// }
```

_Lưu ý: `orderValue` hiện vẫn là field bắt buộc theo schema request, nhưng backend sẽ tự tính lại từ `items` để tránh sai lệch._

### e. Áp Dụng Voucher Khi Đặt Hàng

Truyền mã voucher vào `POST /order` khi tạo đơn hàng:

```javascript
const order = await fetch('/order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify([
    {
      shopId: 1,
      shippingFee: 30000,
      userAddressId: 1,
      cartItemIds: [1, 2],
      shopDiscountCode: 'SHOP10', // Optional — mã voucher shop
      platformDiscountCode: 'PLATFORM20', // Optional — mã voucher sàn
    },
  ]),
}).then((r) => r.json())

// Response:
// {
//   paymentId: 123,
//   orders: [
//     {
//       id: 1,
//       discountAmount: 30000,  // Tổng tiền giảm từ voucher
//       shippingFee: 0,
//       status: 'UNPAID',
//       ...
//     }
//   ]
// }
```

**Quy tắc:**

- `shopDiscountCode` và `platformDiscountCode` đều **optional**
- Có thể truyền cả 2 code cùng lúc (1 Shop + 1 Platform)
- `shopDiscountCode` phải là voucher scope `SHOP` của đúng `shopId`; `platformDiscountCode` phải là voucher scope `PLATFORM`
- Nếu mã không hợp lệ → API trả lỗi `400 Bad Request` kèm message mô tả lý do
- Backend tự validate (kiểm tra hạn, lượt dùng, giá trị tối thiểu, sản phẩm áp dụng) trong cùng transaction
- Khi thành công: tạo `DiscountUsage`, tăng `useCount`. Đánh dấu `isUsed = true` cho voucher trong ví CHỈ khi user đã dùng hết số lượt tối đa (`maxUsesPerUser`).

### f. Luồng Hoàn Chỉnh (Recommended Flow)

```
1. GET /discount/available          → Hiển thị voucher có thể lưu
2. POST /discount/:id/save          → User bấm "Lưu mã"
3. GET /discount/my-vouchers        → Hiển thị kho voucher trong trang Checkout
4. POST /discount/preview           → User chọn mã → preview số tiền giảm
5. POST /order (kèm discountCode)   → Đặt hàng + áp dụng voucher
6. PUT /order/:id (hủy đơn)         → Hệ thống tự hoàn voucher
```

### g. Giao Diện & Tính Toán Giá Trị Voucher (Dành Cho FE)

- **Backend đảm nhận toàn bộ việc tính toán phức tạp:** Frontend không cần tự tính công thức giảm giá (Stacking, kiểm tra Hạn Sử Dụng, Giới hạn User, Giới hạn theo Sản phẩm, ...). Mọi thứ **đã được thiết kế tính toán chuẩn xác** bên Backend.
- **Cách FE vận hành tại trang Checkout (Thanh Toán):**
  1. FE gọi danh sách sản phẩm, tự nhân nhẩm `price * quantity` rải rác trên màn hình.
  2. FE gọi API `POST /discount/preview` bất cứ khi nào User chọn hoặc đổi mã giảm.
  3. API này sẽ soi thẳng vào Data thật, tự lọc ra các Sản phẩm được phép áp dụng (`applyTo: 'SPECIFIC' / 'ALL'`), trả về thẳng 4 con số cuối cùng:
     - `discountAmount`: Số tiền giảm giá cho sản phẩm.
     - `shippingDiscount`: Số tiền giảm cho phí vận chuyển.
     - `finalPrice`: Giá tiền CẦN TRẢ cho Sản phẩm (Đã trừ `discountAmount`).
     - `finalShippingFee`: Giá tiền CẦN TRẢ cho Shipping (Đã trừ `shippingDiscount`).
  4. Frontend **đóng đinh** 4 con số này và in thẳng ra màn hình phần "Tổng Cộng". (UI UX tương tự Shopee).
- **Trường hợp lỗi chặn thanh toán:**
  - Nếu mã hết hạn, chưa đạt giá trị tối thiểu (`minOrderValue`), hoặc user dùng quá số lần quy định, API `preview` (hoặc `POST /order`) sẽ trực tiếp ném ra Error `400 Bad Request` kèm theo Message Tiếng Việt rõ ràng (VD: "Đơn hàng tối thiểu phải từ 50000 để dùng mã này").
  - Frontend chỉ cần `.catch()` lỗi đó và Alert nguyên cái `error.message` ra màn hình, tuyệt đối không cần viết if/else logic ở dưới Client.
- **Cách hiển thị nhãn của từng Voucher:**
  - Nếu Voucher là **Giảm Giá**: Hãy render UI `discountAmount` (Tiết kiệm được) và Giá Sau Giảm (`finalPrice`).
  - Nếu Voucher là **Freeship**: Hãy render UI `shippingDiscount` và Phí Ship Sau Cùng (`finalShippingFee`).
  - Lấy tham số `maxDiscountValue` để in câu: "Giảm {value}%, tối đa {maxDiscountValue}đ".

### h. Hoàn Voucher Khi Hủy Đơn

- Khi user hủy đơn hàng (`PUT /order/:orderId`), hệ thống **tự động hoàn voucher**
- Giảm `useCount`, reset `isUsed = false`, xóa `DiscountUsage`
- User có thể sử dụng lại voucher cho đơn hàng khác
- Frontend không cần xử lý gì thêm — backend tự xử lý hoàn toàn

### i. Quản Lý Voucher (Dành Cho Seller & Admin)

- **Quyền Seller:** Khi gọi API tạo/sửa/xoá mã giảm giá (`POST/PUT/DELETE /discount`), hệ thống sẽ tự động bắt ràng buộc xác thực. Seller chỉ được tạo ra các mã thuộc về shop mình (`scope = 'SHOP'`). Ngoài ra, nếu có truyền kèm danh sách các sản phẩm (mảng `productIds`) để tạo mã cụ thể thì sẽ hệ thống sẽ kiểm tra xem liệu ID sản phẩm này có chính xác thuộc về Seller đó không (nhằm tránh mượn ID shop người khác). Frontend **không cần truyền** `shopId` vào body, Backend tự nội suy qua AccessToken.
- **Quyền Admin:** Admin có toàn quyền tạo/sửa/xoá mã giảm giá TOÀN SÀN (`scope = 'PLATFORM'`). Lúc này `shopId` sẽ được tự động gán bằng `null`.

## 15. Tích Hợp Đăng Ký Shop (Hệ thống Multi-vendor)

Kể từ giờ, thông tin Shop (cửa hàng kinh doanh) đã được tách bạch với thông tin User.

### a. Đăng ký mở Cửa hàng (Shop Registration)

- **API:** `POST /shop/register`
- **Mô tả:** User muốn kinh doanh sẽ phải điền form đăng ký cửa hàng.
- **Body:**
  ```json
  {
    "name": "Tên cửa hàng (Bắt buộc)",
    "description": "Mô tả cửa hàng (Tùy chọn)",
    "phoneNumber": "Số điện thoại shop (Tùy chọn)",
    "address": "Địa chỉ lấy hàng (Tùy chọn)",
    "email": "Email liên hệ (Tùy chọn)"
  }
  ```
- **Xử lý Response:** Nếu thành công API trả về message `"Shop registration created successfully. Please wait for admin approval."` và mặc định trạng thái của shop sẽ là `PENDING`.

### b. Kiểm tra trạng thái Shop hiện tại của User

- **API:** `GET /shop/my-shop`
- **Mô tả:** Dùng để kiểm tra xem User hiện tại đã đăng ký Shop chưa, và trạng thái duyệt thế nào để render giao diện phù hợp.
- **Xử lý logic Frontend:**
  - Nếu API trả về `null`: User chưa từng tạo đơn đăng ký Shop. ➡ _Hiển thị nút "Đăng ký bán hàng"._
  - Nếu API trả về object kèm `status === 'PENDING'`: Đơn đăng ký đang chờ admin duyệt. ➡ _Hiển thị "Hồ sơ đang chờ duyệt"._
  - Nếu `status === 'REJECTED'`: Bị từ chối. ➡ _Hiển thị lý do / Form tạo lại._
  - Nếu `status === 'APPROVED'`: Cửa hàng đã hoạt động. ➡ _Chuyển hướng vào trang Dashboard quản lý (Seller Center)._

### c. Thống kê Doanh Thu & Đơn Hàng (Shop Dashboard)

- **API:** `GET /shop/statistics`
- **Mô tả:** Trả về thống kê số lượng đơn hàng và doanh thu của cửa hàng trong **hôm nay** và **tháng này**.
- **Cách Backend tính toán:** Điểm endpoint này tự động lọc các đơn hàng có trạng thái hợp lệ (`READY_TO_SHIP`, `SHIPPED`, `COMPLETED`) và tự động tính `tổng thành tiền hàng + phí ship - giảm giá voucher`. Frontend không cần tự lấy danh sách đơn về tính.
- **Ví dụ gọi API bằng Fetch:**

  ```javascript
  const stats = await fetch('/shop/statistics', {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json())

  // Response:
  // {
  //   "today": { "totalOrders": 15, "totalRevenue": 2500000 },
  //   "thisMonth": { "totalOrders": 120, "totalRevenue": 24500000 }
  // }
  ```

> **Lưu ý:** Hiện tại `shopId` của một Shop luôn bằng với `userId` (1-1 relationship) nên logic thao tác với đơn hàng, mã giảm giá và video trước đó không bị ảnh hưởng.

## 12. Tích Hợp WebSockets & Thông Báo (Notifications)

### a. WebSockets Connection

- **Trường hợp sử dụng:** Thông báo hệ thống realtime (in-app notification), trạng thái thanh toán, chat.
- **Kết nối:** Cần gửi `accessToken` khi init Socket.

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:9999', {
  extraHeaders: {
    Authorization: `Bearer ${accessToken}`,
  },
})
```

### b. Lắng nghe sự kiện thông báo (In-App Notifications)

- **Event Name:** `new-notification`
- Payload nhận được sẽ tự động lưu vào DB. Dùng payload này để hiện popup (Toast, Snack bar).

```javascript
socket.on('new-notification', (data) => {
  console.log('New notification:', data)
  // Cấu trúc Data:
  // {
  //   id: 1,
  //   title: "Tạo đơn hàng thành công",
  //   body: "Bạn đã thanh toán đơn hàng #12345",
  //   type: "ORDER",
  //   data: { url: "/orders/12345" }
  //   isRead: false,
  //   createdAt: "2023-10-27T10:00:00Z",
  // }
  toast.success(data.title)
})
```

### c. Quy trình UI Notification List (Quả chuông)

1. Gọi **API GET /notifications** ở lần load trang đầu tiên hoặc khi mở danh sách (kèm `isRead=false` để lấy số lượng chuông thông báo chưa đọc).
2. Khi người dùng click vào một dòng thông báo, gọi **API PATCH /notifications/:notificationId/read** để đánh dấu đã xem, sau đó redirect bằng URL trong `data.url`.
3. Nếu người dùng chọn 'Đánh dấu tất cả đã đọc', gọi **API PATCH /notifications/read-all**.

## 16. Phân Quyền Call API Get Đơn Hàng (Order Module)

Hệ thống có sự phân loại rõ ràng cách hiển thị và trả về danh sách Đơn Hàng theo Quyền Người Dùng (Role). Frontend cần gọi đúng Endpoint để lấy dữ liệu.

### a. Dành Cho Seller/Admin (Màn hình Quản Lý Bán Hàng)
- **API:** `GET /order/seller` (Query Params: `page`, `limit`, `status`)
- **Mô tả:** Lấy danh sách các đơn hàng mà khách hàng ĐÃ ĐẶT TỪ SHOP của Cửa Hàng. (Tức là `shopId` của đơn hàng trùng khớp với ID của Seller).
- **Lưu ý Admin:** Nếu token là của Admin, khi gọi API này, hệ thống tự động trả về **TOÀN BỘ ĐƠN HÀNG** của mọi shop để Admin có thể xem được tất cả số liệu kinh doanh trên toàn hệ thống.

### b. Dành Cho Buyer/User thông thường (Màn hình "Đơn Hàng Của Tôi")
- **API:** `GET /order/buyer` (Query Params: `page`, `limit`, `status`)
- **Mô tả:** Lấy danh sách các đơn hàng mà **chính User hiện tại đã mua** (tức là `userId` của đơn hàng trùng khớp với người dùng đăng nhập), bất kể họ mua của shop nào. 
- Mọi user (kể cả Seller/Admin) đều có thể đóng vai trò như một khách hàng. Nếu gọi lệnh này thì họ chỉ thấy các đơn hàng họ đang mua hàng. 

### c. API Mặc định (Khuyên dùng 2 API trên thay thế)
- **API:** `GET /order`
- **Mô tả:** API mặc định từ cũ sử dụng cơ chế tự suy luận tự động. Tuy nhiên hiện tại việc định hướng rõ ràng `buyer` hay `seller` trong path API là bắt buộc để Backend trả về chuẩn Data cho Frontend. 

