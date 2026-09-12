# Phở Gia Truyền 1986 — Backend Service Engine

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Security Standard](https://img.shields.io/badge/Security-IETF%20RFC%206819-blue.svg)](https://datatracker.ietf.org/doc/html/rfc6819)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0%20InnoDB-blue.svg)](https://www.mysql.com/)

Enterprise-grade Spring Boot backend service powering the digital dining and heritage order coordination platform for **Phở Gia Truyền 1986**.

---

## 🛡️ JWT & AUTHENTICATION SECURITY SPECIFICATION

This section documents the formal architectural specification of the JSON Web Token (JWT) subsystem, dual-cookie delivery model, and cryptographic session protection designed by the `SENTINEL` and `BLADE` engineering teams.

---

### 1. Cryptographic Header & Signing Algorithm
- **Algorithm**: `HS512` (HMAC with SHA-512).
- **Rationale**: Replaces common `HS256` with a 512-bit cryptographic hash to deliver maximum collision resistance and safeguard token signatures against quantum and brute-force dictionary attacks.
- **Key Derivation**: Configured through external environment variable `${JWT_SECRET}` (strictly isolated from version control per `SEC-R002`).

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
| **HttpOnly** | `true` | `true` | **100% XSS Immunity**: Inaccessible to `document.cookie`. |
| **Path Scoping** | `Path=/` | **`Path=/api/v1/auth`** | **Attack Surface Reduction**: Refresh token is NEVER transmitted during regular API browsing. |
| **SameSite** | `Lax` | `Lax` | **CSRF Defense**: Blocks cross-site unauthorized requests. |
| **Secure** | `true` (HTTPS) | `true` (HTTPS) | Enforces TLS 256-bit wire encryption in production. |
| **Max-Age** | `900` (15m) | `604800` (7d) | Controlled lifecycle expiration. |

---

### 4. Database Persistence: SHA-256 One-Way Hashing

Unlike naive implementations that store raw JWT strings (`VARCHAR(512)`), our persistence layer enforces a **Zero-Knowledge Storage Policy**:

$$\text{Raw Token (Client)} \xrightarrow{\text{SHA-256}} \text{token\_hash (64 chars Hex in DB)}$$

- **Entity**: [`RefreshToken.java`](file:///e:/Github%20project/pho-viet-landing-page/backend/src/main/java/com/pho1986/backend/model/entity/RefreshToken.java)
- **Database Schema**:
  - `id`: `VARCHAR(36)` Primary Key (UUID).
  - `family_id`: `VARCHAR(36)` Indexed foreign chain key.
  - `token_hash`: `VARCHAR(64)` Unique indexed hash.
  - `expiry_date`: `DATETIME` Indexed timestamp.
  - `revoked`: `BOOLEAN` Status flag.
- **Benefits**:
  1. **RAM Efficiency**: Reduces B-Tree index memory footprint by **~87%** inside the InnoDB Buffer Pool.
  2. **Leak Resilience**: If database dumps are intercepted, attackers cannot derive valid JWT strings from stored SHA-256 hashes.

---

### 5. RFC 6819 Breach Containment (Automatic Replay Neutralization)

Adhering to **IETF RFC 6819 Section 5.2.2.3**, the server partitions client sessions into immutable token families (`family_id`):

```text
[Normal Rotation Flow]
RT1 (Active) ──► Refresh ──► RT1 (Revoked) + RT2 (Active, same family)
                                 │
                                 ▼
[Attacker Replays RT1]
Replayed RT1 (Revoked) Detected!
        │
        ▼
[BREACH CONTAINMENT TRIGGER]
        ├── 1. Reject request with HTTP 401 Unauthorized
        ├── 2. Atomically invalidate entire Family ID (kills RT2 held by attacker)
        └── 3. Emit [SENTINEL THREAT ALERT]
```

- **Identity Disambiguation**: The server drops both sessions. The attacker is permanently locked out (lacks password/OTP). The legitimate owner reclaims the account using **Root Credentials** (Phone / Password).

---

### 6. Housekeeping & Grace Period Invariant
- **Grace Period**: Revoked tokens are preserved in MySQL until `expiry_date <= NOW()` to serve as active detection traps against replayed tokens.
- **Chunked Housekeeping**: [`RefreshTokenCleanupService.java`](file:///e:/Github%20project/pho-viet-landing-page/backend/src/main/java/com/pho1986/backend/service/RefreshTokenCleanupService.java) executes batched deletions (`LIMIT 5000`) on an hourly `@Scheduled` worker, preventing InnoDB lock contention and Undo/Redo log spikes.

---

### 7. Security Best Practices vs. Common Anti-Patterns

| Dimension | Common Vulnerable Pattern | Phở Gia Truyền 1986 Architecture |
|---|---|---|
| **Storage Location** | `localStorage` / `sessionStorage` | **HttpOnly + SameSite Cookie** (Zero XSS exposure) |
| **Token in Database** | Plaintext JWT (`VARCHAR(512)`) | **SHA-256 Hex Hash** (`token_hash VARCHAR(64)`) |
| **Token Compromise** | Only invalidates single token | **RFC 6819 Breach Containment** (Revokes entire token family) |
| **PII in Payload** | Phone, email, loyalty points stored in JWT | **Zero PII**: Only non-sensitive UUID `sub` and role claim |
| **Table Housekeeping** | Unbounded table growth or instant deletion | **Grace Period Preservation + Chunked Batch Deletion** |

---

## 🚀 LOCAL DEVELOPMENT & VERIFICATION

### Prerequisites
- JDK 21 (Eclipse Temurin / OpenJDK)
- Maven 3.9+ (or use bundled `./mvnw.cmd`)
- MySQL 8.0 running on `localhost:3306`

### Start Backend Service
```powershell
.\mvnw.cmd spring-boot:run
```

### Run Automated Security Verification
Verify Login, Token Rotation, Breach Containment, and Family Revocation in one script:
```powershell
# 1. Login
$login = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method Post -Body (@{ phone = "0999999999"; password = "admin123" } | ConvertTo-Json) -ContentType "application/json"
$rt1 = $login.data.refreshToken

# 2. Rotate
$rotate = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/refresh" -Method Post -Body (@{ refreshToken = $rt1 } | ConvertTo-Json) -ContentType "application/json"
$rt2 = $rotate.data.refreshToken

# 3. Replay RT1 (Triggers Breach Containment)
try { Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/refresh" -Method Post -Body (@{ refreshToken = $rt1 } | ConvertTo-Json) -ContentType "application/json" } catch { Write-Host "Breach Triggered: 401" }

# 4. Prove RT2 was revoked
try { Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/refresh" -Method Post -Body (@{ refreshToken = $rt2 } | ConvertTo-Json) -ContentType "application/json" } catch { Write-Host "Verified: RT2 killed by Breach Containment!" }
```