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
  "email": "user@example.com",
  "password": "password123",
  "totpCode": "", // Optional: if 2FA enabled
  "code": "" // Optional: if login with OTP
}
```

### Refresh Token

**POST** `/auth/refresh-token`

```json
{
  "refreshToken": "your_refresh_token_here"
}
```

### Logout

**POST** `/auth/logout`

```json
{
  "refreshToken": "your_refresh_token_here"
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
_No Body_

### Get User Detail

**GET** `/user/:id`
_No Body_

### Create User

**POST** `/user`

```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "phoneNumber": "0987654321",
  "avatar": "", // or null
  "status": "ACTIVE", // ACTIVE, INACTIVE, BLOCKED
  "password": "password123",
  "roleId": 1
}
```

### Update User

**PUT** `/user/:id`

```json
{
  "email": "updated@example.com",
  "name": "Updated Name",
  "phoneNumber": "0987654321",
  "avatar": "",
  "status": "ACTIVE",
  "password": "newpassword123",
  "roleId": 1
}
```

### Delete User

**DELETE** `/user/:id`
_No Body_

---

## Profile Module

### Get Profile

**GET** `/profile`
_No Body_

### Update Profile

**PUT** `/profile`

```json
{
  "name": "My Name",
  "phoneNumber": "0123456789",
  "avatar": "https://example.com/avatar.jpg"
}
```

### Change Password

**PUT** `/profile/change-password`

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

```json
{
  "id": "vi",
  "name": "Tiếng Việt"
}
```

### List Languages

**GET** `/language`
_No Body_

### Get Language Detail

**GET** `/language/:languageId`
_No Body_

### Update Language

**PUT** `/language/:languageId`

```json
{
  "name": "English"
}
```

### Delete Language

**DELETE** `/language/:languageId`
_No Body_

---

## Media Module

### Upload Image

**POST** `/media/images/upload`
_Type:_ `multipart/form-data`
_Key:_ `file` (File)

### Serve Static File

**GET** `/media/static/:filename`
_No Body_

---

## Permission Module

### List Permissions

**GET** `/permission?page=1&limit=10`
_No Body_

### Get Permission Detail

**GET** `/permission/:permissionId`
_No Body_

### Create Permission

**POST** `/permission`

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
_No Body_

---

## Role Module

### List Roles

**GET** `/role?page=1&limit=10`
_No Body_

### Get Role Detail

**GET** `/role/:roleId`
_No Body_

### Create Role

**POST** `/role`

```json
{
  "name": "Admin",
  "description": "Administrator role",
  "isActive": true
}
```

### Update Role

**PATCH** `/role/:roleId`

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

```json
{
  "name": "Brand Name",
  "logo": "https://example.com/logo.png"
}
```

### Update Brand

**PUT** `/brand/:id`

```json
{
  "name": "Brand Name",
  "logo": "https://example.com/logo.png"
}
```

### Delete Brand

**DELETE** `/brand/:id`
_No Body_

---

## Brand Translation Module

### Get Brand Translation Detail

**GET** `/brand-translation`
_Params_: `brandTranslationId` (Query or Param depending on implementation, likely Query currently)

### Create Brand Translation

**POST** `/brand-translation`

```json
{
  "brandId": 1,
  "languageId": "vi",
  "name": "Tên Thương Hiệu",
  "description": "Mô tả chi tiết"
}
```

### Update Brand Translation

**PUT** `/brand-translation/:brandTranslationId`

```json
{
  "brandId": 1,
  "languageId": "vi",
  "name": "Tên Thương Hiệu",
  "description": "Mô tả chi tiết"
}
```

### Delete Brand Translation

**DELETE** `/brand-translation/:brandTranslationId`
_No Body_

---

## Category Module

### List Categories

**GET** `/category`
_No Body_

### Get Category Detail

**GET** `/category/:id`
_No Body_

### Create Category

**POST** `/category`

```json
{
  "name": "Category Name"
}
```

### Update Category

**PATCH** `/category/:id`

```json
{
  "name": "Category Name"
}
```

### Delete Category

**DELETE** `/category/:id`
_No Body_

---

## Category Translation Module

### List Category Translations

**GET** `/category-transaliton`
_No Body_

### Get Category Translation Detail

**GET** `/category-transaliton/:id`
_No Body_

### Create Category Translation

**POST** `/category-transaliton`

```json
{}
```

### Update Category Translation

**PATCH** `/category-transaliton/:id`

```json
{}
```

### Delete Category Translation

**DELETE** `/category-transaliton/:id`
_No Body_

---

## App

**GET** `/`
_No Body_
