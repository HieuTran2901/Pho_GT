# Phở Gia Truyền 1986 — Backend Service Engine

[![Java](https://img.shields.io/badge/Java-21-orange.svg?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Security Standard](https://img.shields.io/badge/Security-IETF%20RFC%206819-blue.svg?style=for-the-badge)](https://datatracker.ietf.org/doc/html/rfc6819)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0%20InnoDB-00758F.svg?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![AWS S3](https://img.shields.io/badge/Storage-AWS%20S3%20Bucket-232F3E.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/s3/)

Enterprise-grade Spring Boot 3.4.3 backend service powering the digital dining, table reservation, and automated payment coordination engine for **Phở Gia Truyền 1986**.

---

## 🏛️ SYSTEM ARCHITECTURE & DATA FLOW

```
[ Client Applications ] (React 18 SPA / Mobile Viewport)
         │
         │  TLS 1.3 / HTTPS (REST Endpoints + HttpOnly SameSite Cookies)
         ▼
[ Spring Boot 3.4.3 Engine ]
 ├── Spring Security Filter Chain (HS512 JWT Auth & Role-Based Access Control)
 ├── Threat Defense & Rate Limiter (Sliding Window In-Memory Bucket)
 ├── Business Logic & Services Layer
 │    ├── OrderService & TableReservationService (Optimistic Locking & TTL Hold)
 │    ├── PaymentService & SepayIpnHandler (Webhook Idempotency & Replay Guard)
 │    ├── LoyaltyService & VoucherRuleEngine (Main-Dish Validation Policy)
 │    └── ChatService (Google Gemini AI Assistant Integration)
 └── Persistence Layer (Spring Data JPA / Hibernate 6)
         │
         ├── HikariCP Connection Pool (Max: 10, Min-Idle: 5)
         ▼
[ MySQL 8.0 Database ] ──► (Tables: orders, users, dining_tables, refresh_tokens, vouchers)
         │
         ▼
[ External Cloud Services ]
 ├── AWS S3 Bucket (Media Assets & Menu Images)
 ├── VietQR / SePay Payment Gateway (Webhook IPN Callback)
 └── Google Generative Language API (Gemini 2.5/3.0)
```

---

## 🛡️ AUTHENTICATION & SESSION SECURITY (IETF RFC 6819 SPECIFICATION)

This section documents the formal architectural specification of the JSON Web Token (JWT) subsystem, dual-cookie delivery model, and cryptographic session protection implemented in the core security layer.

---

### 1. Cryptographic Header & Signing Algorithm
- **Algorithm**: `HS512` (HMAC with SHA-512).
- **Rationale**: Replaces common `HS256` with a 512-bit cryptographic hash to deliver maximum collision resistance and superior key-space entropy against brute-force attacks.
- **Key Derivation**: Configured through external environment variable `${JWT_SECRET}` (strictly isolated from version control).

```json
{
  "alg": "HS512",
  "typ": "JWT"
}
```

---

### 2. Dual-Token Claims Architecture

#### A. Short-Lived Access Token (Lifespan: 15 Minutes)
Designed for stateless, high-throughput authorization across business REST endpoints (`/api/v1/orders`, `/api/v1/tables`, `/api/v1/menu`).

```json
{
  "sub": "7effe476-d2d0-491d-8374-6cd9a34727b0",
  "role": "CUSTOMER",
  "type": "ACCESS",
  "jti": "4b6c3e21-0a1f-492e-b811-9a72d3851b40",
  "iat": 1773480000,
  "exp": 1773480900
}
```

| Claim | Data Type | Description |
|---|---|---|
| `sub` | `UUID` | Subject identifier mapping directly to `users.id`. |
| `role` | `String` | Role-Based Access Control claim (`CUSTOMER` or `ADMIN`). |
| `type` | `String` | Static token discriminator (`ACCESS`) preventing token substitution. |
| `jti` | `UUID` | JWT ID serving as an index key for the real-time $O(1)$ in-memory revocation blacklist. |
| `iat` | `Epoch Sec` | Issued-at timestamp. |
| `exp` | `Epoch Sec` | Expiration timestamp (15 minutes from issue). |

#### B. Long-Lived Refresh Token (Lifespan: 7 Days)
Employed solely to rotate token pairs via `POST /api/v1/auth/refresh`.

```json
{
  "sub": "7effe476-d2d0-491d-8374-6cd9a34727b0",
  "role": "CUSTOMER",
  "type": "REFRESH",
  "jti": "9c12e874-bf43-4f9e-a134-87de31fa0592",
  "iat": 1773480000,
  "exp": 1774084800
}
```

---

### 3. Transport Security: Dual HttpOnly Cookie Isolation

Tokens are never returned in raw JSON for client storage. Instead, they are transmitted via hardened `Set-Cookie` directives:

| Directive | Access Token Cookie | Refresh Token Cookie | Security Benefit |
|---|---|---|---|
| **Cookie Name** | `accessToken` | `refreshToken` | Clear role separation. |
| **HttpOnly** | `true` | `true` | **100% XSS Immunity**: Inaccessible to client-side `document.cookie`. |
| **Path Scoping** | `Path=/` | **`Path=/api/v1/auth`** | **Attack Surface Reduction**: Refresh token is NEVER transmitted during regular browsing. |
| **SameSite** | `Lax` | `Lax` | **CSRF Defense**: Blocks cross-site unauthorized requests. |
| **Secure** | `true` (HTTPS) | `true` (HTTPS) | Enforces TLS wire encryption in production. |
| **Max-Age** | `900` (15m) | `604800` (7d) | Strict lifecycle expiration. |

---

### 4. Database Persistence: SHA-256 One-Way Hashing

Unlike naive implementations that store raw JWT strings (`VARCHAR(512)`), the persistence layer enforces a **Zero-Knowledge Storage Policy**:

$$\text{Raw Token (Client)} \xrightarrow{\text{SHA-256}} \text{token\_hash (64 chars Hex in DB)}$$

- **Entity**: `RefreshToken.java`
- **Database Schema**:
  - `id`: `VARCHAR(36)` Primary Key (UUID).
  - `family_id`: `VARCHAR(36)` Indexed foreign chain key.
  - `token_hash`: `VARCHAR(64)` Unique indexed hash.
  - `expiry_date`: `DATETIME` Indexed timestamp.
  - `revoked`: `BOOLEAN` Status flag.
- **Benefits**:
  1. **RAM Efficiency**: Reduces B-Tree index memory footprint by **~87%** inside the InnoDB Buffer Pool.
  2. **Leak Resilience**: Even if database backups are compromised, attackers cannot derive valid JWT strings from stored SHA-256 hashes.

---

### 5. RFC 6819 Breach Containment (Automatic Replay Neutralization)

Adhering to **IETF RFC 6819 Section 5.2.2.3**, the server partitions client sessions into immutable token families (`family_id`):

```text
[Normal Rotation Flow]
RT1 (Active) ──► Refresh Request ──► RT1 (Revoked) + RT2 (Active, same family)
                                         │
                                         ▼
[Attacker Replays Compromised RT1]
Replayed RT1 (Revoked) Detected!
        │
        ▼
[BREACH CONTAINMENT TRIGGERED]
        ├── 1. Reject request with HTTP 401 Unauthorized
        ├── 2. Atomically invalidate entire Family ID (kills RT2 held by attacker)
        └── 3. Log high-severity Security Event & trigger Token Blacklist
```

- **Identity Disambiguation**: The server drops both sessions. The attacker is permanently locked out. The legitimate owner reclaims the account using primary credentials.

---

### 6. Scheduled Cleanup & Grace Period Invariant
- **Grace Period**: Revoked tokens are preserved in MySQL until `expiry_date <= NOW()` to serve as active detection traps against replayed tokens.
- **Chunked Housekeeping**: `RefreshTokenCleanupService.java` executes batched deletions (`LIMIT 5000`) on an hourly `@Scheduled` worker, preventing InnoDB table locks and Undo/Redo log contention.

---

## ⚡ CORE REST API ENDPOINTS

| Category | Method | Endpoint | Access | Description |
|---|:---:|---|:---:|---|
| **Authentication** | `POST` | `/api/v1/auth/login` | Public | Authenticates credentials, sets dual HttpOnly cookies. |
| | `POST` | `/api/v1/auth/refresh` | Cookie | Rotates token family and issues fresh access token. |
| | `POST` | `/api/v1/auth/logout` | Authenticated | Clears cookies and revokes active token family. |
| **Table Management**| `GET` | `/api/v1/tables` | Public | Retrieves real-time table layout and live reservation status. |
| | `POST` | `/api/v1/tables/lock` | Authenticated | Acquires temporary 15-minute optimistic hold on a table. |
| **Order & Payment** | `POST` | `/api/v1/orders` | Public / User | Creates new dining order with item customization. |
| | `GET` | `/api/v1/orders/{code}` | Public / User | Retrieves order status with PII masking (`098****888`). |
| | `POST` | `/api/v1/payments/sepay/ipn` | Webhook | Receives SePay payment notification with signature check. |
| **Loyalty & Rewards**| `GET` | `/api/v1/loyalty/profile` | Authenticated | Fetches member tier points, history, and gift vouchers. |
| | `POST` | `/api/v1/vouchers/validate`| Public / User | Validates voucher rules (including main-dish policy). |

---

## 🚀 LOCAL DEVELOPMENT & VERIFICATION

### Prerequisites
- **JDK**: Java 21 LTS (OpenJDK / Eclipse Temurin)
- **Build Tool**: Maven 3.9+ (or use bundled `./mvnw.cmd`)
- **Database**: MySQL 8.0 running on `localhost:3306`

### Start Backend Service
```powershell
# Windows PowerShell
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

The backend starts with default profile `dev` listening on: [`http://localhost:8080`](http://localhost:8080)

### Automated Test Suite
```powershell
# Run unit and integration tests
.\mvnw.cmd clean test
```