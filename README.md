# WashWhiz

WashWhiz is a React + Vite laundry management system for customer and staff workflows. It includes customer login and registration, staff admin access, wash preset pricing logic, and order tracking.

## Frontend

- React 19
- Vite
- React Router
- Plain CSS

## Backend

- PHP API in `php-api/`
- MySQL schema in `sql/washwhiz_schema.sql`
- APIs mirror the requested CRUD and JSON structure using PDO and `status/message` responses.

## Local setup

1. Start XAMPP and activate Apache + MySQL.
2. Create the `washwhiz` database and import `sql/washwhiz_schema.sql`.
3. Place the `php-api` folder into your XAMPP `htdocs` directory as `washwiz/php-api`.
4. Run the Vite app in the project root:
   npm install
   npm run dev
5. Open the local app URL and log in with the default staff account:
   - Email: admin@washwhiz.com
   - Password: admin123

## Customer and staff API endpoints

- `http://localhost/washwiz/php-api/customers.php`
- `http://localhost/washwiz/php-api/staff.php`
- `http://localhost/washwiz/php-api/wash_presets.php`
- `http://localhost/washwiz/php-api/orders.php`

The frontend fetches these routes for customer login, preset management, and order tracking.
