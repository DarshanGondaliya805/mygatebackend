# 🏠 MyGate Backend API

Production-grade **Node.js + TypeScript + Sequelize** backend for society/apartment management.

---

## 🗂 Project Structure

```
mygate-backend/
├── src/
│   ├── config/           # app.ts, db.ts, database.js (for CLI)
│   ├── controllers/      # auth, society, user, visitor, complaint, misc
│   ├── middlewares/      # auth (JWT), error handler, validator
│   ├── models/           # 14 Sequelize TypeScript models + associations
│   ├── routes/           # All route files + master index
│   ├── services/         # auth.service, notification.service
│   ├── utils/            # jwt, logger, response helpers, upload (multer)
│   ├── app.ts            # Express app factory
│   └── server.ts         # Entry point
├── migrations/           # 14 JS migration files (one per table)
├── seeders/              # Super admin seeder
├── .env.development      # Dev env vars (edit before running)
├── .env.production       # Prod env vars
├── .sequelizerc          # CLI paths config
├── tsconfig.json
└── package.json
```

---

## 🚀 Full Setup Commands

### Step 1 — Install dependencies
```bash
npm install
```

### Step 2 — Configure environment
Edit `.env.development`:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mygate_dev
DB_USER=root
DB_PASSWORD=

JWT_SECRET=atleast_32_char_random_string_here
JWT_REFRESH_SECRET=another_32_char_random_string

SUPER_ADMIN_EMAIL=superadmin@mygate.com
SUPER_ADMIN_PASSWORD=SuperAdmin@123
```

### Step 3 — Create MySQL database
```sql
CREATE DATABASE mygate_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4 — Run migrations (creates all 14 tables)
```bash
NODE_ENV=development npm run db:migrate
```

### Step 5 — Seed super admin
```bash
NODE_ENV=development npm run db:seed
```

### Step 6 — Create upload & log directories
```bash
mkdir -p uploads/images uploads/documents uploads/misc logs
```

### Step 7 — Start dev server
```bash
npm run dev
# Server starts on http://localhost:3000
# Health: http://localhost:3000/health
```

---

## 📋 All NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon + ts-node (hot reload) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run compiled production build |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:migrate:undo:all` | Undo all migrations |
| `npm run db:seed` | Seed super admin |
| `npm run db:seed:undo` | Remove seeded data |
| `npm run db:reset` | Full reset: undo + migrate + seed |

---

## 🗃 Database Tables (14 Tables)

| Table | Description |
|-------|-------------|
| `users` | All roles: super_admin, admin, user, security |
| `societies` | Apartment societies/complexes |
| `blocks` | Towers/blocks within a society |
| `flats` | Flats within blocks |
| `society_policies` | Rules & policies (category: parking, pets, etc.) |
| `amenities` | Pool, gym, clubhouse, etc. |
| `staff` | Security, cleaning, maintenance staff + documents |
| `visitors` | Gate visitor log with in/out time + vehicle |
| `daily_helpers` | Milkman, maid, laundry registrations per flat |
| `helper_entry_logs` | Daily in/out tracking for helpers |
| `complaints` | User complaints with admin status + notes |
| `events` | Society events/announcements |
| `service_contacts` | Plumber, electrician, etc. |
| `notifications` | In-app notifications (+ FCM push placeholder) |

All tables support **soft-delete** (paranoid/deletedAt) except `helper_entry_logs`.

---

## 🔐 API Endpoints Summary

Base URL: `http://localhost:3000/api/v1`

### Public (No Auth Required)
```
GET    /public/societies                          — list all active societies
GET    /public/societies/:societyId/blocks        — all blocks in a society
GET    /public/blocks/:blockId/flats              — all flats in a block
```

### Auth
```
POST   /auth/login              Public — login with phone/email + fcm_token (optional)
POST   /auth/refresh            Public — refresh access token
POST   /auth/logout             Auth   — logout (clears fcm_token)
GET    /auth/me                 Auth   — own profile
PUT    /auth/change-password    Auth   — change password
```

### Users
```
POST   /users/register          Public — self-register (pending approval)
POST   /users                   Admin+ — create user/admin/security
GET    /users                   Admin+ — list users (filter: role, is_approved, search)
GET    /users/directory         Auth   — building contact directory
GET    /users/:id               Auth   — user profile
PUT    /users/:id               Auth   — update user
PUT    /users/:id/approve       Admin+ — approve pending user
DELETE /users/:id               Admin+ — delete user
```

### Societies
```
POST   /societies               Super Admin — create society with blocks+flats
GET    /societies               Admin+      — list all societies (paginated, ?search=)
GET    /societies/:id           Auth        — society detail with blocks+flats
PUT    /societies/:id           Admin+      — update society
DELETE /societies/:id           Super Admin — delete society
```

### Blocks & Flats
```
POST   /blocks                          Admin+ — add block with flats
GET    /blocks/society/:societyId       Auth   — blocks in society (with flats)
DELETE /blocks/:id                      Admin+ — delete block

POST   /flats                           Admin+ — add flat
GET    /flats/block/:blockId            Auth   — flats in block
GET    /flats/society/:societyId        Auth   — all flats in society
DELETE /flats/:id                       Admin+ — delete flat
```

### Visitors
```
POST   /visitors                        Security/Admin — create entry (image upload)
POST   /visitors/pre-approve            User/Admin     — pre-approve visitor
GET    /visitors/lookup/:phone          Security+      — auto-fill repeat visitor
GET    /visitors                        Auth           — list (role-filtered)
PUT    /visitors/:id/status             User/Admin     — approve or reject
PUT    /visitors/:id/checkout           Security+      — mark exit
```

### Complaints
```
POST   /complaints                      User/Admin — raise complaint (image upload)
GET    /complaints                      Auth       — list (users see own only)
GET    /complaints/:id                  Auth       — complaint detail
PUT    /complaints/:id/status           Admin+     — update status + add note
```

### Staff
```
POST   /staff                           Admin+ — create (image + document upload)
GET    /staff                           Auth   — list (filter: ?staff_type=security)
PUT    /staff/:id                       Admin+ — update
DELETE /staff/:id                       Admin+ — delete
```

### Daily Helpers
```
POST   /daily-helpers                   User/Admin     — register helper
GET    /daily-helpers/my                User           — my helpers
GET    /daily-helpers                   Admin/Security — all society helpers
POST   /daily-helpers/entry             Security       — log entry in
PUT    /daily-helpers/:helper_id/exit   Security       — log exit
```

### Events
```
POST   /events                          Admin+ — create event (image upload)
GET    /events                          Auth   — list upcoming events
PUT    /events/:id                      Admin+ — update
DELETE /events/:id                      Admin+ — delete
```

### Service Contacts
```
POST   /service-contacts                Admin+ — add contact
GET    /service-contacts                Auth   — list (filter: ?service_type=plumber)
PUT    /service-contacts/:id            Admin+ — update
DELETE /service-contacts/:id            Admin+ — delete
```

### Policies & Amenities
```
POST/GET/PUT/DELETE   /policies         Admin+/Auth — manage society policies
POST/GET/PUT/DELETE   /amenities        Admin+/Auth — manage amenities
```

### Notifications
```
GET    /notifications                   Auth — list notifications (?unread=true for unread only)
PUT    /notifications/:id/read          Auth — mark single notification as read
PUT    /notifications/read-all          Auth — mark all as read
POST   /notifications/test              Auth — send test notification to self (dev/debug)
```

---

## 🔑 Auth Header
```
Authorization: Bearer <access_token>
```

## 📁 File Upload Fields

| Endpoint | Field | Max Count |
|----------|-------|-----------|
| `POST /users` or register | `image` | 1 |
| `POST /staff` | `image` + `documents` | 1 + 5 |
| `POST /societies` | `logo` | 1 |
| `POST /visitors` | `image` | 1 |
| `POST /complaints` | `images` | 3 |
| `POST /events` | `image` | 1 |
| `POST /amenities` | `image` | 1 |

---

## 🌍 Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `development` or `production` |
| `PORT` | HTTP port (default 3000) |
| `DB_HOST/NAME/USER/PASSWORD` | MySQL connection |
| `JWT_SECRET` | Access token secret (32+ chars) |
| `JWT_EXPIRES_IN` | Access token TTL e.g. `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | Refresh TTL e.g. `30d` |
| `SUPER_ADMIN_EMAIL/PASSWORD` | Seeded super admin credentials |
| `UPLOAD_PATH` | File storage path |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |

---

## 🔄 Role Hierarchy & Permissions

```
super_admin  →  Full access across all societies
admin        →  Full access within their society
user         →  Own flat: visitors, complaints, helpers, events, directory
security     →  Visitor entry, helper entry/exit, pre-approved list
```

---

## 🛠 Production Deployment

```bash
# 1. Build
npm run build

# 2. Set prod env and run migrations
NODE_ENV=production npm run db:migrate
NODE_ENV=production npm run db:seed

# 3. Start with PM2
pm2 start dist/server.js --name mygate-api --env production

# 4. Nginx config for uploads (serve statically)
# location /uploads { root /var/www/mygate; }
```

**Production checklist:**
- Change super admin password immediately after seeding
- Set strong JWT secrets (64+ chars, random)
- Configure CORS origin in `src/app.ts`
- Enable `DB_SSL=true` for cloud databases
- Configure Firebase credentials for push notifications
- Set up log rotation for `logs/` directory
