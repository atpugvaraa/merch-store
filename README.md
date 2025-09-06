# Merch Store

Portal for distributing Creative Computing Society merch to society members.

## Tech Stack

**Client**: NextJS, TypeScript, TailwindCSS

**Server**: NextJS/NodeJS

**Database**: PostgreSQL, Drizzle ORM

## Run Live Production

Visit [https://merch.ccstiet.com/](https://merch.ccstiet.com/) for using the website on live production environment

## Run Locally

### Clone this project

```sh
git clone https://github.com/creative-computing-society/merch-store.git
```

### To run the project

Go to project directory
```sh
cd merch-store
```

Install the project dependencies
```sh
npm i
```

Setup db using postgresql
```sh
./start-database.sh # have docker installed
pnpm db:push
```

Run the local server
```sh
pnpm dev
```

Create a \`.env\` file in the project's root directory (base directory), and add \`DEBUG\`, \`ALLOWED_HOSTS\`, \`SECURITY_KEY\`, \`EMAIL_HOST_USER\`, and \`EMAIL_HOST_PASSWORD\`.

This project uses CCS Single Sign On (SSO) for user authentication. You would be required to add \`JWT_SECRET_KEY\` to the \`.env\` aswell which would be equal to the application's client secret created on CCS Auth portal.

You would also be required to add \`PHONEPE_MERCHANT_ID\` and \`PHONEPE_SALT_KEY\` for the utilisation of PhonePe Payment Gateway.

At last, you would be required to add the database credentials in the \`.env\` file aswell, which includes the fields \`DATABASE_URL\`, \`POSTGRES_NAME\`,\`POSTGRES_USER\`, \`POSTGRES_PASSWORD\`, \`POSTGRES_HOST\`, and \`POSTGRES_PORT\`.

## Endpoints

### Legends

-   (⭕) - Authentication (correct token in localStorage) is required
-   (🔵) - Staff/Admin permissions required

### Auth

-   POST /auth/login/ - Login user with token from CCS SSO
-   (⭕) GET /auth/logout/ - Logout user
-   (⭕) GET /auth/user/ - Get user details

### Products

-   (⭕) GET /product/all/ - Fetches all product data
-   (⭕) GET /product/\<int:product_id\>/ - Fetches single product data by id
-   (⭕) POST /cart/add/ - Adds product to cart
-   (⭕) GET /cart/view/ - View cart items
-   (⭕) POST /cart/delete/ - Deletes product from cart
-   (⭕) POST /cart/update/ - Update cart product parameters like quantity

### Orders

-   (⭕) GET /order/all/ - Fetches all previous orders
-   (⭕) GET /order/\<int:order_id\>/ - Fetches single order details by id
-   (⭕) POST /order/place/ - Place order for the current cart items
-   (⭕) POST /order/apply-discount/ - Apply discount code on the order
-   (⭕) POST /payment/\<str:order_id\>/ - Fetch payment details for the order id
-   (⭕) POST /payment_completed/result/ - Gives result for successful/failed payment
-   (⭕) POST /payment_completed/verify/ - Verifies payment status after successful/failed payment. Handled by PhonePe

### Dashboard

-   (🔵) GET /dashboard/ - Renders Dashboard page template
-   (🔵) POST /stop-orders/ - Stops accepting all orders and clears cart items
-   (🔵) POST /start-orders/ - Starts accepting all orders
-   (🔵) GET /discount-codes/ - Renders Discount Code page template
-   (🔵) POST /discount-codes/create/ - Creates a discount code
-   (🔵) POST /discount-codes/edit/\<int:code_id\>/ - Edits a discount code with code id
-   (🔵) POST /discount-codes/delete/\<int:code_id\>/ - Deletes a discount code with code id
-   (🔵) GET /products/ - Renders Products page template
-   (🔵) POST /products/create/ - Creates a product
-   (🔵) POST /products/edit/\<int:product_id\>/ - Edits a product with code id
-   (🔵) POST /products/delete/\<int:product_id\>/ - Deletes a product with code id
-   (🔵) GET /scan_qr/ - Renders Scan QR code page template
-   (🔵) POST /scan_qr/scan/ - Verify details and marked as delivered after successful scan
-   (🔵) POST /export_csv/\<int:id\>/ - Exports a CSV file for given order item id

## Maintainers

-   [Akshat Bakshi - @akshat448](https://github.com/akshat448/)
-   [Sakshham Bhagat - @SakshhamTheCoder](https://github.com/sakshhamthecoder/)