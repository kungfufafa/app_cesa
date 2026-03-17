# Admin API V1 Auth + Helpdesk Guide for Mobile

Dokumen ini merangkum alur `login -> logout` dan seluruh flow Helpdesk yang saat ini aktif di backend agar frontend mobile bisa implementasi tanpa menebak-nebak behavior server.

## 1. Ringkasan

- Semua endpoint admin mobile berada di prefix `/admin/api/v1`.
- Auth menggunakan Laravel Sanctum token bearer.
- Helpdesk mobile ada di prefix `/admin/api/v1/helpdesk`.
- Jangan membuat UI status bebas. Status ticket **harus** mengikuti matrix transisi backend.
- Gunakan field `abilities` dari response ticket untuk menentukan tombol/action yang ditampilkan.
- Untuk detail ticket, selalu panggil endpoint `show`, karena komentar dan history ada di sana.

## 2. Auth

### Base header setelah login

Gunakan header ini untuk semua endpoint yang butuh auth:

```http
Authorization: Bearer {token}
Accept: application/json
```

### 2.1 Login

- Method: `POST`
- URL: `/admin/api/v1/login`
- Auth: tidak perlu
- Content-Type: `application/json`

Request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Success response:

```json
{
  "message": "Login successful",
  "token": "1|abcd1234efgh5678ijkl...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

Catatan frontend:

- Simpan `token`.
- Untuk semua request selanjutnya, kirim `Authorization: Bearer {token}`.
- Invalid credential saat ini keluar sebagai `422`, bukan `401`.

Contoh invalid credential:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": [
      "The provided credentials are incorrect."
    ]
  }
}
```

### 2.2 Logout

- Method: `POST`
- URL: `/admin/api/v1/logout`
- Auth: bearer token
- Content-Type: `application/json`

Success response:

```json
{
  "message": "Logout successful"
}
```

Catatan frontend:

- Setelah logout sukses, hapus token dari storage lokal.

## 3. Helpdesk Overview

### Prefix

Semua endpoint helpdesk:

- `/admin/api/v1/helpdesk/meta`
- `/admin/api/v1/helpdesk/tickets`
- `/admin/api/v1/helpdesk/tickets/{ticket}`
- `/admin/api/v1/helpdesk/tickets/{ticket}/comments`

### Status ID

Gunakan ID status berikut:

| ID | Name |
| --- | --- |
| `1` | Open |
| `2` | In Progress |
| `3` | Cancelled |
| `4` | Closed |

### Box / Inbox Model

Backend mengenal 3 box:

| Key | Keterangan |
| --- | --- |
| `incoming` | Ticket yang masuk ke handler / unit |
| `outgoing` | Ticket yang dibuat oleh user itu sendiri |
| `all` | Semua ticket, hanya untuk user global |

Jika frontend tidak kirim `box`, backend akan default:

- user internal/helpdesk: `incoming`
- user pelapor biasa: `outgoing`

## 4. Recommended Mobile Flow

### Flow pelapor

1. Login
2. `GET /admin/api/v1/helpdesk/meta`
3. `POST /admin/api/v1/helpdesk/tickets`
4. `GET /admin/api/v1/helpdesk/tickets?box=outgoing`
5. `GET /admin/api/v1/helpdesk/tickets/{id}`
6. Jika `abilities.comment = true`, kirim public comment
7. Jika `abilities.cancel = true`, tampilkan tombol cancel
8. Jika `abilities.reopen = true`, tampilkan tombol reopen
9. Logout

### Flow handler / admin helpdesk

1. Login
2. `GET /admin/api/v1/helpdesk/meta`
3. `GET /admin/api/v1/helpdesk/tickets?box=incoming`
4. `GET /admin/api/v1/helpdesk/tickets/{id}`
5. Jika `abilities.comment = true`, kirim comment
6. Jika `abilities.add_internal_note = true`, boleh pilih `visibility=internal`
7. Jika `abilities.close = true`, tampilkan tombol close
8. Jika `abilities.cancel = true`, tampilkan tombol cancel
9. Logout

## 5. Endpoint Detail

## 5.1 GET `/admin/api/v1/helpdesk/meta`

Dipakai untuk load dropdown/filter/form create.

- Method: `GET`
- Auth: bearer token
- Query optional:
  - `unit_id`

Response shape:

```json
{
  "message": "Ticket metadata retrieved successfully.",
  "data": {
    "boxes": [
      { "key": "incoming", "label": "Incoming" },
      { "key": "outgoing", "label": "Outgoing" }
    ],
    "priorities": [
      { "id": 1, "name": "Critical/Urgent" }
    ],
    "statuses": [
      { "id": 1, "name": "Open" },
      { "id": 2, "name": "In Progress" },
      { "id": 3, "name": "Cancelled" },
      { "id": 4, "name": "Closed" }
    ],
    "units": [
      { "id": 1, "name": "IT Support" }
    ],
    "problem_categories": [
      {
        "id": 10,
        "unit_id": 1,
        "name": "Laptop",
        "default_responsible_id": 22
      }
    ],
    "responsible_users": [
      { "id": 22, "name": "Helpdesk Agent" }
    ],
    "companies": [
      { "id": 200, "name": "Allowed Company" }
    ],
    "default_company_id": 200
  }
}
```

Catatan frontend:

- `problem_categories` akan terfilter kalau kirim `unit_id`.
- `responsible_users` juga mengikuti `unit_id`.
- Meskipun backend mengembalikan semua status, **jangan** render dropdown status bebas di mobile. Gunakan matrix transisi di bawah.

## 5.2 GET `/admin/api/v1/helpdesk/tickets`

Dipakai untuk list ticket.

- Method: `GET`
- Auth: bearer token
- Query optional:
  - `box`: `incoming|outgoing|all`
  - `search`
  - `priority_id`
  - `ticket_status_id`
  - `unit_id`
  - `problem_category_id`
  - `responsible_id`
  - `per_page` max `100`

Contoh:

```http
GET /admin/api/v1/helpdesk/tickets?box=incoming&ticket_status_id=1&per_page=20
```

Response:

- `data` berisi list ticket.
- `meta` berisi pagination Laravel + custom `box` dan `counts`.
- `links` berisi pagination links Laravel.

Custom fields yang penting:

```json
{
  "meta": {
    "box": "incoming",
    "counts": {
      "incoming": 12,
      "outgoing": 3,
      "all": 80
    }
  }
}
```

Catatan frontend:

- List view sebaiknya pakai field summary saja.
- Untuk komentar dan history, lanjut ke endpoint `show`.

## 5.3 POST `/admin/api/v1/helpdesk/tickets`

Dipakai untuk create ticket baru.

- Method: `POST`
- Auth: bearer token
- Content-Type:
  - `application/json` jika tanpa file
  - `multipart/form-data` jika ada attachment

Field:

| Field | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `priority_id` | integer | ya | ID priority |
| `unit_id` | integer | ya | ID unit |
| `problem_category_id` | integer | ya | Harus sesuai unit |
| `company_id` | integer | tidak | Jika kosong, backend pakai `default_company_id` user |
| `title` | string | ya | Judul ticket |
| `description` | string | ya | Deskripsi ticket |
| `supporting_attachments[]` | file[] | tidak | Maks 5 file, masing-masing maks 10240 KB |

Contoh multipart:

```text
priority_id=2
unit_id=1
problem_category_id=10
company_id=200
title=Cannot access printer
description=Printer in finance room is offline.
supporting_attachments[]=<file>
supporting_attachments[]=<file>
```

Behavior penting:

- `owner_id` otomatis diisi dari user login.
- `ticket_status_id` default `Open`.
- `responsible_id` bisa otomatis terisi dari `default_responsible_id` pada category.

Response:

- status `201`
- body mengembalikan **full ticket resource**

## 5.4 GET `/admin/api/v1/helpdesk/tickets/{ticket}`

Dipakai untuk detail ticket.

- Method: `GET`
- Auth: bearer token

Response utama:

```json
{
  "data": {
    "id": 123,
    "title": "Cannot access printer",
    "description": "Printer in finance room is offline.",
    "priority_id": 2,
    "unit_id": 1,
    "owner_id": 50,
    "problem_category_id": 10,
    "company_id": 200,
    "ticket_status_id": 1,
    "responsible_id": 22,
    "approved_at": null,
    "solved_at": null,
    "close_reason": null,
    "cancel_reason": null,
    "reopen_reason": null,
    "attachments": [
      {
        "name": "photo.jpg",
        "path": "helpdesk/tickets/abc.jpg",
        "url": "https://..."
      }
    ],
    "priority": {
      "id": 2,
      "name": "High"
    },
    "unit": {
      "id": 1,
      "name": "IT Support"
    },
    "problem_category": {
      "id": 10,
      "name": "Laptop"
    },
    "company": {
      "id": 200,
      "name": "Allowed Company"
    },
    "ticket_status": {
      "id": 1,
      "name": "Open"
    },
    "owner": {
      "id": 50,
      "name": "Reporter Name",
      "email": "reporter@example.com",
      "avatar_url": null
    },
    "responsible": {
      "id": 22,
      "name": "Helpdesk Agent",
      "email": "agent@example.com",
      "avatar_url": null
    },
    "comments": [],
    "histories": [],
    "abilities": {
      "view": true,
      "update": true,
      "delete": false,
      "comment": true,
      "change_status": true,
      "assign_responsible": true,
      "cancel": true,
      "close": false,
      "reopen": false,
      "add_internal_note": true
    },
    "created_at": "2026-03-17T10:00:00+00:00",
    "updated_at": "2026-03-17T10:05:00+00:00"
  }
}
```

Catatan frontend:

- `comments` dan `histories` hanya reliable di endpoint detail.
- Pelapor/mobile biasa **tidak** akan melihat internal note.
- User internal dengan akses inbox/helpdesk bisa melihat public comment + internal note.
- UI action sebaiknya selalu ditentukan dari `abilities`.

## 5.5 PATCH `/admin/api/v1/helpdesk/tickets/{ticket}`

Dipakai untuk:

- update data umum ticket
- assign responsible
- transition status terkontrol
- replace/append attachment ticket

### A. Update field umum

Field yang boleh dikirim:

| Field | Type |
| --- | --- |
| `priority_id` | integer |
| `unit_id` | integer |
| `problem_category_id` | integer |
| `company_id` | integer or null |
| `title` | string |
| `description` | string |
| `responsible_id` | integer or null |
| `existing_supporting_attachments[]` | string[] |
| `supporting_attachments[]` | file[] |

Catatan attachment:

- Untuk mempertahankan file lama, kirim `existing_supporting_attachments[]` dari `attachments[].path`.
- Jika upload file baru, backend akan merge `existing_supporting_attachments` + file baru.

Contoh update umum:

```json
{
  "title": "Printer offline di ruang finance",
  "description": "Butuh pengecekan kabel dan koneksi.",
  "company_id": 200
}
```

### B. Transition status

Backend **tidak** menerima lompatan status bebas.

Gunakan endpoint yang sama, tetapi kirim `ticket_status_id` sesuai matrix:

#### Start progress

```json
{
  "ticket_status_id": 2
}
```

#### Close ticket

```json
{
  "ticket_status_id": 4,
  "close_reason": "Perbaikan sudah selesai."
}
```

#### Cancel ticket

```json
{
  "ticket_status_id": 3,
  "cancel_reason": "Ticket duplikat."
}
```

#### Reopen ticket

```json
{
  "ticket_status_id": 1,
  "reopen_reason": "Masalah muncul lagi."
}
```

### C. Matrix status resmi

| From | To | Siapa | Reason wajib |
| --- | --- | --- | --- |
| Open | In Progress | handler / internal helpdesk | tidak |
| Open | Cancelled | owner atau handler | `cancel_reason` |
| Open | Closed | tidak boleh | - |
| In Progress | Closed | handler / internal helpdesk | `close_reason` |
| In Progress | Cancelled | handler / internal helpdesk | `cancel_reason` |
| Closed | Open | owner ticket | `reopen_reason` |
| Cancelled | Open | tidak boleh | - |
| Cancelled | Closed | tidak boleh | - |

Behavior tambahan:

- `approved_at` akan terisi saat ticket pertama kali keluar dari `Open`.
- `solved_at` akan terisi saat masuk `Closed`.
- Saat reopen (`Closed -> Open`), `solved_at` akan di-reset ke `null`.

Error pattern yang perlu di-handle frontend:

- `403`: user tidak boleh melakukan action itu pada state tersebut
- `422`: payload invalid, reason wajib kosong, reason dikirim di transisi yang salah, dst

Contoh `422`:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "close_reason": [
      "Alasan penutupan tiket wajib diisi."
    ]
  }
}
```

## 5.6 POST `/admin/api/v1/helpdesk/tickets/{ticket}/comments`

Dipakai untuk menambah comment atau internal note.

- Method: `POST`
- Auth: bearer token
- Content-Type:
  - `application/json` jika tanpa file
  - `multipart/form-data` jika ada file

Field:

| Field | Type | Required | Keterangan |
| --- | --- | --- | --- |
| `comment` | string | ya | Isi komentar |
| `visibility` | string | tidak | `public` atau `internal`, default `public` |
| `attachments[]` | file[] | tidak | Maks 5 file, masing-masing maks 10240 KB |

Contoh public comment:

```json
{
  "comment": "Ticket sedang ditangani oleh tim support."
}
```

Contoh internal note:

```json
{
  "comment": "Butuh koordinasi internal dengan vendor printer.",
  "visibility": "internal"
}
```

Behavior penting:

- Response mengembalikan **full ticket resource**, bukan hanya comment.
- Jika handler memberi **public** comment saat status ticket masih `Open`, backend otomatis pindah ke `In Progress`.
- Jika owner memberi public comment, status tidak berubah otomatis.
- Internal note tidak mengubah status.
- Owner tidak boleh membuat internal note.
- Internal note hanya terlihat oleh user internal yang punya akses inbox/helpdesk.

Comment object shape:

```json
{
  "id": 900,
  "ticket_id": 123,
  "comment": "Ticket sedang ditangani.",
  "visibility": "public",
  "attachments": [
    {
      "name": "reply.jpg",
      "path": "helpdesk/comments/xyz.jpg",
      "url": "https://..."
    }
  ],
  "user": {
    "id": 22,
    "name": "Helpdesk Agent",
    "email": "agent@example.com",
    "avatar_url": null
  },
  "created_at": "2026-03-17T10:10:00+00:00",
  "updated_at": "2026-03-17T10:10:00+00:00"
}
```

## 5.7 DELETE `/admin/api/v1/helpdesk/tickets/{ticket}`

Dipakai untuk delete ticket.

- Method: `DELETE`
- Auth: bearer token

Praktisnya:

- owner hanya bisa delete ticket saat masih `Open`
- user internal butuh permission delete

Success response:

```json
{
  "message": "Ticket deleted successfully."
}
```

## 6. Arti `abilities`

Field `abilities` ada di resource ticket dan wajib jadi sumber utama UI.

| Ability | Arti UI |
| --- | --- |
| `view` | boleh buka detail |
| `update` | boleh edit field umum ticket |
| `delete` | boleh tampilkan tombol delete |
| `comment` | boleh kirim comment |
| `change_status` | secara umum ada aksi status yang tersedia |
| `assign_responsible` | boleh ubah responsible |
| `cancel` | boleh tampilkan tombol cancel |
| `close` | boleh tampilkan tombol close |
| `reopen` | boleh tampilkan tombol reopen |
| `add_internal_note` | boleh tampilkan opsi `visibility=internal` |

Rekomendasi:

- Jangan hitung role sendiri di frontend.
- Jangan asumsikan owner selalu bisa edit/cancel/reopen.
- Tampilkan tombol hanya bila ability bernilai `true`.

## 7. Visibility Comment

### `public`

- Terlihat oleh owner/pelapor
- Terlihat oleh handler/internal helpdesk
- Bisa memicu `Open -> In Progress` bila comment dikirim handler

### `internal`

- Hanya terlihat oleh user internal helpdesk
- Tidak terlihat oleh owner/pelapor
- Tidak memicu perubahan status

Rekomendasi frontend:

- Bila `add_internal_note = false`, jangan tampilkan selector visibility.
- Default selector ke `public`.

## 8. Attachment Rules

Attachment ticket dan comment memakai konfigurasi yang sama:

- max file per request: `5`
- max size per file: `10240 KB`

Ticket attachment:

- directory default: `helpdesk/tickets`

Comment attachment:

- directory default: `helpdesk/comments`

Frontend notes:

- Gunakan `multipart/form-data` saat upload file.
- Gunakan `attachments[].url` bila tersedia untuk preview/download.
- Simpan `attachments[].path` bila ingin kirim ulang di `existing_supporting_attachments`.

## 9. History

Setiap perubahan status menghasilkan record history.

Shape history:

```json
{
  "id": 1,
  "ticket_id": 123,
  "ticket_status": {
    "id": 2,
    "name": "In Progress"
  },
  "user": {
    "id": 22,
    "name": "Helpdesk Agent",
    "email": "agent@example.com",
    "avatar_url": null
  },
  "created_at": "2026-03-17T10:10:00+00:00",
  "updated_at": "2026-03-17T10:10:00+00:00"
}
```

Untuk timeline mobile:

- gunakan `histories` dari endpoint detail
- urutan history dari backend adalah terbaru dulu

## 10. Frontend Do / Don't

### Do

- Gunakan `show` untuk halaman detail.
- Gunakan `abilities` untuk semua action button.
- Pisahkan UI public comment vs internal note.
- Tampilkan field reason terminal (`close_reason`, `cancel_reason`, `reopen_reason`) di detail ticket bila ada.
- Saat update attachment ticket, kirim `existing_supporting_attachments` untuk file lama yang tetap dipertahankan.

### Don't

- Jangan buat dropdown status bebas berdasarkan `statuses` dari meta.
- Jangan tampilkan internal note ke pelapor biasa.
- Jangan asumsikan invalid login mengembalikan `401`; saat ini invalid login keluar sebagai `422`.
- Jangan asumsikan endpoint comment mengembalikan object comment saja; response-nya full ticket.

## 11. Quick Checklist untuk Mobile Developer

- Login screen memakai `POST /admin/api/v1/login`
- Simpan bearer token
- Semua request auth kirim `Authorization: Bearer {token}`
- Load `GET /admin/api/v1/helpdesk/meta` saat masuk modul helpdesk
- List screen pakai `GET /admin/api/v1/helpdesk/tickets`
- Detail screen pakai `GET /admin/api/v1/helpdesk/tickets/{id}`
- Create ticket pakai `POST /admin/api/v1/helpdesk/tickets`
- Update field umum / transition status pakai `PATCH /admin/api/v1/helpdesk/tickets/{id}`
- Add comment / internal note pakai `POST /admin/api/v1/helpdesk/tickets/{id}/comments`
- Logout pakai `POST /admin/api/v1/logout`
