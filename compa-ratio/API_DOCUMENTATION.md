# API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Register
**POST** `/api/auth/register`

**Request:**
```json
{
  "username": "client_admin",
  "email": "admin@company.com",
  "password": "SecurePassword123",
  "name": "Company Name",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "id": "68d68c8428e65d5de1d80d1f",
  "username": "client_admin",
  "email": "admin@company.com",
  "role": "CLIENT_ADMIN",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "username": "client_admin",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": "68d68c8428e65d5de1d80d1f",
  "username": "client_admin",
  "email": "admin@company.com",
  "role": "CLIENT_ADMIN"
}
```

---

## 3. Individual Calculation
**POST** `/api/calc/individual`

**Request:**
```json
{
  "employeeCode": "EMP001",
  "employeeName": "John Doe",
  "jobTitle": "Software Engineer",
  "yearsExperience": 7,
  "performanceRating5": 4,
  "currentSalary": 85000.00,
  "midOfScale": 90000.00
}
```

**Response:**
```json
{
  "employeeCode": "EMP001",
  "employeeName": "John Doe",
  "jobTitle": "Software Engineer",
  "yearsExperience": 7,
  "performanceRating5": 4,
  "currentSalary": 85000.00,
  "midOfScale": 90000.00,
  "compaRatio": 94.44,
  "compaLabel": "At Range",
  "perfBucket": 2,
  "increasePct": 5.0,
  "newSalary": 89250.00
}
```

---

## 4. Bulk Upload
**POST** `/api/calc/bulk/upload`

**Request:**
- Content-Type: `multipart/form-data`
- Form field: `file` (Excel file)

**Response:**
```json
{
  "batchId": "batch_20251006103045",
  "totalRows": 150,
  "successCount": 148,
  "errorCount": 2,
  "results": [...]
}
```

---

## 5. Get Calculation Results
**GET** `/api/calc/results`

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 20)

**Response:**
```json
{
  "content": [
    {
      "employeeCode": "EMP001",
      "employeeName": "John Doe",
      "jobTitle": "Software Engineer",
      "yearsExperience": 7,
      "perfBucket": 2,
      "currentSalary": 85000.00,
      "midOfScale": 90000.00,
      "compaRatio": 94.44,
      "compaLabel": "At Range",
      "increasePct": 5.0,
      "newSalary": 89250.00
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "numberOfElements": 20
}
```

---

## 6. Analyze by Salary Increase Amount
**GET** `/api/calc/analysis/salary-increase`

**Query Parameters:**
- `from` (optional) - Salary increase amount from (inclusive)
- `to` (optional) - Salary increase amount to (inclusive)
- `page` (default: 0)
- `size` (default: 20)

**Example Requests:**
```
GET /api/calc/analysis/salary-increase?from=3000&to=8000
GET /api/calc/analysis/salary-increase?from=5000
GET /api/calc/analysis/salary-increase?to=7000
GET /api/calc/analysis/salary-increase
```

**Response:**
```json
{
  "content": [
    {
      "employeeCode": "EMP001",
      "employeeName": "John Doe",
      "jobTitle": "Software Engineer",
      "yearsExperience": 7,
      "perfBucket": 2,
      "currentSalary": 85000.00,
      "midOfScale": 90000.00,
      "compaRatio": 94.44,
      "compaLabel": "At Range",
      "increasePct": 5.0,
      "newSalary": 89250.00
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "numberOfElements": 20
}
```

---

## 7. Analyze by Percentage Increase
**GET** `/api/calc/analysis/percentage-increase`

**Query Parameters:**
- `from` (optional) - Percentage increase from (inclusive)
- `to` (optional) - Percentage increase to (inclusive)
- `page` (default: 0)
- `size` (default: 20)

**Example Requests:**
```
GET /api/calc/analysis/percentage-increase?from=3.5&to=7.0
GET /api/calc/analysis/percentage-increase?from=5.0
GET /api/calc/analysis/percentage-increase?to=6.5
GET /api/calc/analysis/percentage-increase
```

**Response:**
```json
{
  "content": [
    {
      "employeeCode": "EMP002",
      "employeeName": "Jane Smith",
      "jobTitle": "Product Manager",
      "yearsExperience": 5,
      "perfBucket": 3,
      "currentSalary": 95000.00,
      "midOfScale": 100000.00,
      "compaRatio": 95.00,
      "compaLabel": "At Range",
      "increasePct": 6.0,
      "newSalary": 100700.00
    }
  ],
  "totalElements": 75,
  "totalPages": 4,
  "numberOfElements": 20
}
```

---

## 8. Get Dashboard Statistics
**GET** `/api/admin/dashboard/client-statistics`

**Query Parameters:**
- `clientId` (optional for CLIENT_ADMIN, required for SUPER_ADMIN)

**Response:**
```json
{
  "clientId": "68d68c8428e65d5de1d80d1f",
  "totalEmployees": 150,
  "totalCurrentSalary": 12500000.00,
  "totalNewSalary": 13125000.00,
  "totalPercentageChange": 5.00,
  "percentageIncreaseAnalysis": {
    "minimum": 2.00,
    "maximum": 8.50,
    "average": 5.25
  },
  "amountIncreaseAnalysis": {
    "minimum": 1500.00,
    "maximum": 12000.00,
    "average": 4166.67
  },
  "lastUpdated": "2025-10-06T10:30:45.123Z"
}
```

---

## 9. Get Adjustment Matrix
**GET** `/api/matrix`

**Response:**
```json
{
  "clientId": "68d68c8428e65d5de1d80d1f",
  "matrix": [
    {
      "perfBucket": 1,
      "compaFrom": 0.71,
      "compaTo": 0.85,
      "pctLt5Years": 17.0,
      "pctGte5Years": 21.0,
      "active": true
    }
  ]
}
```

---

## 10. Update Adjustment Matrix
**PUT** `/api/matrix`

**Request:**
```json
{
  "matrix": [
    {
      "perfBucket": 1,
      "compaFrom": 0.71,
      "compaTo": 0.85,
      "pctLt5Years": 17.0,
      "pctGte5Years": 21.0
    }
  ]
}
```

**Response:**
```json
{
  "clientId": "68d68c8428e65d5de1d80d1f",
  "matrix": [
    {
      "perfBucket": 1,
      "compaFrom": 0.71,
      "compaTo": 0.85,
      "pctLt5Years": 17.0,
      "pctGte5Years": 21.0,
      "active": true
    }
  ]
}
```

---

## 11. Get User Profile
**GET** `/api/profile`

**Response:**
```json
{
  "id": "68d68c8428e65d5de1d80d1f",
  "username": "client_admin",
  "email": "admin@company.com",
  "fullName": "John Doe",
  "role": "CLIENT_ADMIN",
  "companyName": "Acme Corp",
  "industry": "Technology",
  "performanceRatingScale": "FIVE_POINT",
  "currency": "USD",
  "avatarUrl": "https://..."
}
```

---

## 12. Update Profile
**PUT** `/api/profile`

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@company.com",
  "industry": "Technology"
}
```

**Response:**
```json
{
  "id": "68d68c8428e65d5de1d80d1f",
  "username": "client_admin",
  "email": "john.doe@company.com",
  "fullName": "John Doe",
  "role": "CLIENT_ADMIN",
  "companyName": "Acme Corp",
  "industry": "Technology",
  "performanceRatingScale": "FIVE_POINT",
  "currency": "USD"
}
```

---

## 13. Change Password
**POST** `/api/profile/change-password`

**Request:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

## 14. Upload Profile Picture
**POST** `/api/profile/upload-image`

**Request:**
- Content-Type: `multipart/form-data`
- Form field: `file` (image file)

**Response:**
```json
{
  "message": "Profile image uploaded successfully",
  "avatarUrl": "uploads/profiles/user123/profile_image_user123_20250127_182345_123.jpg"
}
```

---

## 15. Get Upload History
**GET** `/api/upload-history`

**Query Parameters:**
- `page` (default: 0)
- `size` (default: 10)

**Response:**
```json
{
  "uploads": [
    {
      "id": "upload_123",
      "clientId": "68d68c8428e65d5de1d80d1f",
      "originalFileName": "employees_2025.xlsx",
      "batchId": "batch_20251006103045",
      "totalRows": 150,
      "successRows": 148,
      "errorRows": 2,
      "status": "COMPLETED",
      "createdAt": "2025-10-06T10:30:45Z"
    }
  ],
  "totalElements": 45,
  "totalPages": 5
}
```

---

## Response Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## User Roles
- **CLIENT_ADMIN** - Manage own company data
- **SUPER_ADMIN** - View all clients and manage client accounts