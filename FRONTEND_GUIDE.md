# Hướng Dẫn Tích Hợp API (Frontend Integration Guide)

Tài liệu này cung cấp các quy chuẩn và hướng dẫn để đội Frontend tích hợp với hệ thống API backend một cách hiệu quả và mượt mà nhất.

## 1. Cấu Hình Chung

- **Base URL (Dev):** `http://localhost:9999`
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

### a. Upload Ảnh (Images)

Khi upload ảnh để sử dụng trong Product, Brand, SKU,...:

1. **Upload ảnh lên server** bằng API `POST /media/images/upload`:
   - Header **BẮT BUỘC**: `Content-Type: multipart/form-data`
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
         "url": "https://ecom-be-nestjs.s3.us-east-1.amazonaws.com/images/abc123.png",
         "name": "product-image.png",
         "key": "images/abc123.png",
         "type": "image/png"
       },
       {
         "url": "https://ecom-be-nestjs.s3.us-east-1.amazonaws.com/images/def456.png",
         "name": "product-image2.png",
         "key": "images/def456.png",
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
   // Result: ["{data: [{url: https://...}]}", ...]

   // ✅ ĐÚNG - Làm như thế này
   const correctImages = response.data.map((item) => item.url)
   // Result: ["https://...", "https://..."]
   ```

4. **Sử dụng URLs khi tạo/cập nhật Product**:
   ```json
   {
     "name": "Áo thun",
     "images": [
       "https://ecom-be-nestjs.s3.us-east-1.amazonaws.com/images/abc123.png",
       "https://ecom-be-nestjs.s3.us-east-1.amazonaws.com/images/def456.png"
     ],
     ...
   }
   ```

### b. Lưu Ý Quan Trọng

- Field `images` trong Product/SKU **PHẢI** là **array of string URLs**, KHÔNG phải object hay stringified object
- Backend đã có xử lý tự động để convert format cũ (nếu có) sang format mới, nhưng Frontend nên gửi đúng format ngay từ đầu
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

### a. Lấy danh sách Video

- Gọi `GET /shop-videos?page=1&limit=10`.
- Hiển thị UI theo dạng cuộn trang (swiping up/down) hoặc carousel dọc. Dữ liệu trả về sẽ bao gồm URL video (`videoUrl`) và các thông số tương tác (like, cmt).

### b. Xử lý Tương Tác

1. **Thích (Like):**
   - Nút thả tim gọi API `POST /shop-videos/:id/like`.
   - UI nên là **Optimistic Update**: Ngay khi click thì UI chuyển tim đỏ liền + tăng số đếm (dù API chưa trả về xong) để cho người xem cảm giác thao tác cực nhanh.
2. **Bình luận (Comments):**
   - Lấy danh sách bình luận (Public - không cần đăng nhập vẫn xem được): `GET /shop-videos/:id/comments` (Có phân trang).
   - Thêm bình luận (Cần đăng nhập): `POST /shop-videos/:id/comments`.

---

_Tài liệu này được dùng kèm với `API_LIST.md` để tra cứu chi tiết từng endpoint._
