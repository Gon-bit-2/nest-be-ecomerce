# NestJS E-commerce Backend

This is the backend API for the NestJS E-commerce application.

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🚀 Installation

1.  **Clone the repository**

    ```bash
    git clone <repository_url>
    cd <repository_folder>
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Environment Configuration**

    Create a `.env` file in the root directory. You can copy the following template:

    ```env
    # Database connection string
    DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"

    # JWT Secrets
    ACCESS_TOKEN_SECRET="your_access_token_secret"
    REFRESH_TOKEN_SECRET="your_refresh_token_secret"

    # App Port
    PORT=9999

    # Other configurations (Mail, AWS S3, Google Auth, etc. as needed)
    ```

4.  **Database Setup**

    Run Prisma migrations to set up the database schema:

    ```bash
    npx prisma migrate dev
    ```

    Or to push schema directly:

    ```bash
    npx prisma db push
    ```

5.  **Seed Data (Optional)**

    If there is a seed script:

    ```bash
    npm run initData
    ```

## 🏃‍♂️ Running the Application

- **Development Mode**

  ```bash
  npm run start:dev
  ```

- **Production Mode**

  ```bash
  npm run build
  npm run start:prod
  ```

## 📚 API Documentation

A comprehensive list of APIs is available in [API_LIST.md](./API_LIST.md).

## 📂 Project Structure

- `src/`: Source code
  - `auth/`: Authentication module
  - `user/`: User management
  - `product/`: Product catalog (Public & Management)
  - `order/`: Order processing
  - `cart/`: Shopping cart
  - `payment/`: Payment processing (SePay webhook integration)
  - `shared/`: Shared models, constants, and utilities

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e
```
