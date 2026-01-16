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

### Disable 2FA

**POST** `/auth/2fa/disable`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "totpCode": "123456", // Optional
  "code": "123456" // Optional
}
```

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

- `file`: (Binary File)

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
  "fileSize": "1024" // string representation of size
}
```

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

**GET** `/brand-translation?brandTranslationId=1`

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

**GET** `/category-transaliton?categoryTranslationId=1`

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

**PUT** `/category-transaliton/:id`

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

**DELETE** `/category-transaliton/:id`

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

### Get Product Detail

**GET** `/product/:productId`

_No Auth Headers_
_No Body_

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
      "value": "Red - S",
      "price": 200000,
      "stock": 100,
      "image": "https://example.com/red-s.jpg"
    }
    // ... more SKUs
  ],
  "productTranslations": [
    {
      "languageId": "vi",
      "name": "Áo Thun Premium",
      "description": "Mô tả sản phẩm"
    },
    {
      "languageId": "en",
      "name": "Premium T-Shirt",
      "description": "Product Description"
    }
  ]
}
```

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
- `status`: "PENDING_PAYMENT" | "PENDING_PICKUP" | "PENDING_DELIVERY" | "DELIVERED" | "RETURNED" | "CANCELLED" (Optional)

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
    "receiver": {
      "name": "John Doe",
      "phone": "0123456789",
      "address": "123 St, City"
    },
    "cartItemIds": [1, 2]
  }
]
```

### Cancel Order

**PUT** `/order/:orderId`

**Headers**

- `Authorization`: `Bearer <accessToken>`

_No Body_

---

## Payment Module

### Webhook Receiver (SePay)

**POST** `/payment/receiver`

_No Auth Headers_ (Public Endpoint for Webhook)

```json
{
  "id": 12345,
  "gateway": "VCB",
  "transactionDate": "2023-10-27 10:00:00",
  "accountNumber": "0123456789",
  "subAccount": null,
  "amountIn": 0,
  "amountOut": 0,
  "accumulated": 0,
  "code": "PAY123",
  "transactionContent": "Thanh toan don hang",
  "referenceNumber": null,
  "body": null,
  "transferType": "in", // or "out"
  "transferAmount": 100000,
  "referenceCode": null,
  "description": "Full sms content"
}
```
