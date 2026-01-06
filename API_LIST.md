# List of APIs

Base URL: `localhost:9999`

## Auth Module

### Send OTP

**POST** `/auth/otp`

```json
{
  "email": "user@example.com",
  "type": "REGISTER" // REGISTER, FORGOT_PASSWORD, LOGIN, DISABLE_2FA
}
```

### Register

**POST** `/auth/register`

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

```json
{
  "email": "admin@gmail.com",
  "password": "password123",
  "totpCode": "", // Optional: if 2FA enabled (6 digits)
  "code": "" // Optional: if login with OTP (6 digits)
}
```

### Refresh Token

**POST** `/auth/refresh-token`

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
_No Body_

### Google Callback

**GET** `/auth/google/callback?state=...&code=...`
_No Body_

### Forgot Password

**POST** `/auth/forgot-password`

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

```json
{}
```

### Disable 2FA

**POST** `/auth/2fa/disable`

```json
{
  "totpCode": "123456", // Or use code
  "code": "123456" // Or use totpCode
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
  "email": "updated@example.com",
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
  "yearOfBirth": 1999,
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
  "name": "Tiếng Việt",
  "flag": "https://example.com/flag-vi.png"
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
  "name": "English",
  "flag": "https://example.com/flag-en.png"
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
  _Type:_ `multipart/form-data`
  _Key:_ `file` (File)

### Serve Static File

**GET** `/media/static/:filename`
_No Body_

### Get Presigned URL

**POST** `/media/images/upload/presigned-url`

```json
{
  "fileName": "image.png",
  "fileType": "image/png"
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

**PATCH** `/role/:roleId`

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
_No Body_

### Get Brand Detail

**GET** `/brand/:id`
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
_No Body_

### Get Category Detail

**GET** `/categories/:id`
_No Body_

### Create Category

**POST** `/categories`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Electronics",
  "parentId": null // Or parent category ID like 1
}
```

### Update Category

**PUT** `/categories/:id`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "name": "Laptops",
  "parentId": 1
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
_No Body_

### Get Product Detail

**GET** `/product/:productId`
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
      "options": ["M", "L"]
    }
  ],
  "skus": [
    {
      "value": "Color-Red-Size-M",
      "price": 200000,
      "stock": 50,
      "image": "https://example.com/red-m.jpg"
    },
    {
      "value": "Color-Red-Size-L",
      "price": 200000,
      "stock": 40,
      "image": "https://example.com/red-l.jpg"
    },
    {
      "value": "Color-Blue-Size-M",
      "price": 200000,
      "stock": 50,
      "image": "https://example.com/blue-m.jpg"
    },
    {
      "value": "Color-Blue-Size-L",
      "price": 200000,
      "stock": 40,
      "image": "https://example.com/blue-l.jpg"
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
  "publishedAt": "2023-10-27T00:00:00.000Z",
  "name": "Áo Thun Premium Update",
  "basePrice": 220000,
  "virtualPrice": 320000,
  "brandId": 1,
  "categories": [1],
  "images": ["https://example.com/product-image-1-new.jpg"],
  "variants": [
    {
      "value": "Color",
      "options": ["Red"]
    },
    {
      "value": "Size",
      "options": ["M"]
    }
  ],
  "skus": [
    {
      "value": "Color-Red-Size-M",
      "price": 220000,
      "stock": 60,
      "image": "https://example.com/red-m.jpg"
    }
  ]
}
```

### Delete Product

**DELETE** `/manage-product/products/:productId`
**Headers**

- `Authorization`: `Bearer <accessToken>`
  _No Body_

---

## Product Translation Module

### Get Product Translation Detail

**GET** `/product-translation?productTranslationId=1`
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
  "name": "Áo Thun Cao Cấp",
  "description": "Áo thun cotton 100% thoáng mát, thấm hút mồ hôi tốt.",
  "content": "<h1>Chi tiết sản phẩm</h1><p>Nội dung chi tiết...</p>"
}
```

### Update Product Translation

**PATCH** `/product-translation?productTranslationId=1`

**Headers**

- `Authorization`: `Bearer <accessToken>`

```json
{
  "productId": 1,
  "languageId": "vi",
  "name": "Áo Thun Cao Cấp (Mới)",
  "description": "Áo thun cotton 100% thoáng mát, thấm hút mồ hôi tốt. Mẫu mới 2024.",
  "content": "<h1>Chi tiết sản phẩm 2024</h1><p>Nội dung chi tiết mới...</p>"
}
```

### Delete Product Translation

**DELETE** `/product-translation?productTranslationId=1`
**Headers**

- `Authorization`: `Bearer <accessToken>`
  _No Body_

---

## App

**GET** `/`
**Headers**

- `Authorization`: `Bearer <accessToken>`
  _No Body_
