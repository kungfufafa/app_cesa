# API Mobile Reference

Dokumen ini merangkum API mobile yang aktif untuk modul `auth`, `helpdesk`, dan `presensi` berdasarkan implementasi aplikasi saat ini.

Terakhir diperbarui: `2026-03-22`

## Ringkasan

- Base path API: `/admin/api/v1`
- Autentikasi: `Bearer token` via Laravel Sanctum
- Default header:

```http
Accept: application/json
Authorization: Bearer {TOKEN}
```

- Gunakan `Content-Type: application/json` untuk request JSON.
- Gunakan `multipart/form-data` untuk endpoint yang mengirim file atau foto.

## Flow Mobile Yang Direkomendasikan

1. `POST /admin/api/v1/login`
2. Simpan `token`
3. `GET /admin/api/v1/me`
4. `GET /admin/api/v1/helpdesk/meta`
5. `GET /admin/api/v1/presensi/attendance/today`
6. `GET /admin/api/v1/presensi/schedule` bila perlu halaman detail jadwal

## Catatan Umum

- Semua endpoint selain `login` butuh token.
- Field `responsible`, `default_company`, `allowed_companies`, `avatar_url`, dan beberapa relasi lain bisa `null`.
- Pada data restore saat ini, field helpdesk `description` dan `comment` umumnya berupa rich text HTML, bukan plain text.
- Pada data helpdesk legacy, link file bisa muncul di `attachments` array dan/atau inline di HTML `description` / `comment`.
- Untuk helpdesk, mobile sebaiknya membaca opsi form dari endpoint `meta`, jangan hardcode prioritas, status, unit, category, atau responsible.
- Untuk presensi, mobile harus siap menerima penolakan validasi yang realistis seperti di luar radius, sudah check-in, jadwal diblokir, atau sedang cuti.

---

## Auth

### `POST /admin/api/v1/login`

Login admin/mobile user dan membuat token Sanctum.

Rate limit: `5 request / 1 menit`

Request body:

```json
{
  "email": "admin@example.com",
  "password": "secret-password",
  "device_name": "iPhone 15 Pro"
}
```

Catatan:

- `device_name` opsional tapi sangat disarankan.
- Jika `device_name` sama dengan sesi sebelumnya, token device lama akan di-rotate.

Response `200`:

```json
{
  "message": "Login successful",
  "token": "1|xxxxxxxxxxxxxxxx",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "language": "id",
    "is_active": true,
    "resource_permission": "global",
    "avatar_url": null,
    "roles": [],
    "permissions": [],
    "default_company": {
      "id": 200,
      "name": "Allowed Company"
    },
    "allowed_companies": [],
    "current_access_token": {
      "name": "iPhone 15 Pro",
      "last_used_at": null,
      "created_at": "2026-03-19T10:00:00+07:00",
      "expires_at": null
    }
  }
}
```

Response umum:

- `422` kredensial salah atau akun inactive
- `429` terlalu banyak percobaan login

### `GET /admin/api/v1/me`

Mengambil konteks user yang sedang login untuk bootstrap mobile.

Response `200`:

```json
{
  "message": "Authenticated user retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "language": "id",
    "is_active": true,
    "resource_permission": "global",
    "avatar_url": null,
    "roles": [],
    "permissions": [],
    "default_company": null,
    "allowed_companies": [],
    "current_access_token": {
      "name": "Android Phone",
      "last_used_at": null,
      "created_at": "2026-03-19T10:00:00+07:00",
      "expires_at": null
    }
  }
}
```

### `POST /admin/api/v1/logout`

Menghapus token aktif saat ini.

Response `200`:

```json
{
  "message": "Logout successful"
}
```

### `POST /admin/api/v1/logout-all`

Menghapus semua token milik user yang sedang login.

Response `200`:

```json
{
  "message": "Logged out from all devices successfully."
}
```

---

## Helpdesk

Prefix: `/admin/api/v1/helpdesk`

## Rule Bisnis Penting

- Semua endpoint helpdesk memerlukan token.
- Ticket owner hanya bisa mengubah atribut ticket selama masih `Open`, tetapi owner masih bisa `reopen` ticket `Closed` miliknya sendiri.
- Internal note tidak terlihat oleh owner ticket.
- Comment publik dari handler pada ticket `Open` akan otomatis memindahkan status ke `In Progress`.
- Ticket yang sudah terminal (`Cancelled` atau `Closed`) tidak bisa dikomentari lagi.
- Attachment ticket/comment mendukung ekstensi:
  `jpg`, `jpeg`, `png`, `webp`, `pdf`, `doc`, `docx`, `xls`, `xlsx`, `csv`, `txt`
- Batas attachment:
  maksimal `5 file`, masing-masing maksimal `10 MB`.
- Beberapa ticket legacy masih mungkin memiliki `responsible_id = null`, jadi mobile harus siap menampilkan PIC sebagai kosong.

### `GET /admin/api/v1/helpdesk/meta`

Mengambil metadata untuk form ticket dan filter list.

Query parameter:

- `unit_id` opsional, untuk memfilter problem category dan responsible user per unit

Catatan:

- `boxes` bisa berisi `all` untuk user yang memiliki akses global.
- `responsible_users` bisa kosong.
- `default_responsible_id` pada category sering bernilai `null` pada data restore saat ini.

Response `200`:

```json
{
  "message": "Ticket metadata retrieved successfully.",
  "data": {
    "boxes": [
      { "key": "incoming", "label": "Incoming" },
      { "key": "outgoing", "label": "Outgoing" }
    ],
    "priorities": [
      { "id": 1, "name": "Critical/Urgent" },
      { "id": 2, "name": "High" }
    ],
    "statuses": [
      { "id": 1, "name": "Open" },
      { "id": 2, "name": "In Progress" },
      { "id": 3, "name": "Cancelled" },
      { "id": 4, "name": "Closed" }
    ],
    "units": [
      { "id": 1, "name": "BUSDEV" },
      { "id": 2, "name": "IT" }
    ],
    "problem_categories": [
      {
        "id": 4,
        "unit_id": 2,
        "name": "Odoo Program",
        "default_responsible_id": 509
      }
    ],
    "responsible_users": [
      { "id": 509, "name": "Legacy User 18" }
    ],
    "companies": [
      { "id": 200, "name": "Allowed Company" }
    ],
    "default_company_id": 200
  }
}
```

### `GET /admin/api/v1/helpdesk/tickets`

Mengambil daftar ticket.

Query parameter:

- `box`: `incoming`, `outgoing`, `all`
- `search`
- `priority_id`
- `ticket_status_id`
- `unit_id`
- `problem_category_id`
- `responsible_id`
- `per_page` max `100`

Catatan:

- Jika `box` tidak dikirim, server memilih default sesuai permission user.
- Hasil response berbentuk paginator Laravel resource collection.
- Gunakan endpoint detail ticket untuk `comments` dan `histories`; payload list tidak boleh dianggap sebagai source of truth untuk detail percakapan atau histori status.

Response ringkas:

```json
{
  "data": [
    {
      "id": 123,
      "title": "Cannot access printer",
      "description": "Printer in finance room is offline.",
      "priority_id": 2,
      "unit_id": 2,
      "owner_id": 10,
      "problem_category_id": 4,
      "company_id": 200,
      "ticket_status_id": 1,
      "responsible_id": 509,
      "approved_at": null,
      "solved_at": null,
      "close_reason": null,
      "cancel_reason": null,
      "reopen_reason": null,
      "attachments": [],
      "priority": { "id": 2, "name": "High" },
      "unit": { "id": 2, "name": "IT" },
      "problem_category": { "id": 4, "name": "Odoo Program" },
      "company": { "id": 200, "name": "Allowed Company" },
      "ticket_status": { "id": 1, "name": "Open" },
      "owner": {
        "id": 10,
        "name": "Reporter",
        "email": "reporter@example.com",
        "avatar_url": null
      },
      "responsible": {
        "id": 509,
        "name": "Legacy User 18",
        "email": "legacy18@example.com",
        "avatar_url": null
      },
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
      "created_at": "2026-03-19T10:00:00+07:00",
      "updated_at": "2026-03-19T10:00:00+07:00"
    }
  ],
  "meta": {
    "box": "incoming",
    "counts": {
      "incoming": 10,
      "outgoing": 5
    }
  }
}
```

### `POST /admin/api/v1/helpdesk/tickets`

Membuat ticket baru.

Gunakan `multipart/form-data` jika mengirim attachment.

Field:

- `priority_id` required
- `unit_id` required
- `problem_category_id` required
- `company_id` optional
- `title` required
- `description` required
- `supporting_attachments[]` optional

Contoh:

```http
POST /admin/api/v1/helpdesk/tickets
Content-Type: multipart/form-data
```

```text
priority_id=2
unit_id=2
problem_category_id=4
company_id=200
title=Cannot access printer
description=Printer in finance room is offline.
supporting_attachments[]=<file>
```

Rule penting:

- `problem_category_id` harus sesuai `unit_id`
- `company_id` harus termasuk company yang diizinkan untuk user
- `responsible_id` tidak dikirim saat create dari mobile; server akan memakai default category bila ada

Response `201`: ticket resource lengkap + `message`

### `GET /admin/api/v1/helpdesk/tickets/{ticket}`

Mengambil detail satu ticket.

Response:

- resource ticket lengkap
- `comments` hanya berisi comment yang boleh dilihat user
- `histories` berisi histori status
- `abilities` dipakai mobile untuk mengaktifkan/menonaktifkan action UI
- `description` dapat berupa HTML rich text
- pada ticket legacy, file pendukung kadang hanya tersedia sebagai link inline di HTML `description`

### `PATCH /admin/api/v1/helpdesk/tickets/{ticket}`

Mengubah ticket atau melakukan transisi status.

Field update biasa:

- `priority_id`
- `unit_id`
- `problem_category_id`
- `company_id`
- `title`
- `description`
- `responsible_id`
- `existing_supporting_attachments[]`
- `supporting_attachments[]`

Field transisi status:

- `ticket_status_id`
- `close_reason`
- `cancel_reason`
- `reopen_reason`

Transisi status yang didukung:

- `Open -> In Progress`
- `Open -> Cancelled`
- `In Progress -> Closed`
- `In Progress -> Cancelled`
- `Closed -> Open` dengan `reopen_reason`

Rule penting:

- `close_reason` wajib saat `Closed`
- `cancel_reason` wajib saat `Cancelled`
- `reopen_reason` wajib saat reopen dari `Closed` ke `Open`
- owner hanya bisa edit ticket saat `Open`
- handler/admin bisa assign `responsible_id`

### `DELETE /admin/api/v1/helpdesk/tickets/{ticket}`

Soft delete ticket.

Response `200`:

```json
{
  "message": "Ticket deleted successfully."
}
```

### `POST /admin/api/v1/helpdesk/tickets/{ticket}/comments`

Menambahkan comment ke ticket.

Gunakan `multipart/form-data` jika mengirim attachment.

Field:

- `comment` required
- `visibility` optional: `public` atau `internal`
- `attachments[]` optional

Contoh:

```text
comment=Ticket is being handled by support.
visibility=public
attachments[]=<file>
```

Rule penting:

- owner tidak boleh membuat `internal` comment
- internal note hanya terlihat oleh handler / inbox unit yang berwenang
- public comment dari handler pada ticket `Open` akan auto jadi `In Progress`
- `comment` dapat berupa HTML rich text
- pada comment legacy, file bisa muncul sebagai attachment array dan/atau link inline di HTML comment

---

## Presensi

Prefix: `/admin/api/v1/presensi`

## Rule Bisnis Penting

- `attendance/check-in` dan `attendance/check-out` di-throttle `5 request / 5 menit`
- Endpoint foto dan upload bukti memakai `multipart/form-data`
- Endpoint `schedule/ban` ada, tapi bersifat internal/admin-only karena butuh permission `update_presensi_schedule`
- Untuk user non-WFA, check-in/check-out harus berada dalam radius office
- Jika `is_mock_location=true` dan konfigurasi reject aktif, request akan ditolak
- Field seperti `check_in_status`, `check_out_status`, `attendance_status`, dan `attendance_flags` di response attendance dihitung dari data legacy attendance, bukan dibaca dari kolom khusus status di database.

### `GET /admin/api/v1/presensi/attendance/today`

Mengambil ringkasan presensi hari ini dan histori bulan berjalan.

Catatan:

- `today` bisa `null` walaupun `active_schedule` ada; itu berarti user belum check-in hari ini.
- `this_month` bisa berupa array kosong.

Response `200`:

```json
{
  "success": true,
  "message": "Attendance retrieved successfully.",
  "data": {
    "today": {
      "id": 10,
      "date": "2026-03-19",
      "start_time": "08:05:00",
      "end_time": "17:05:00",
      "check_in_status": "on_time",
      "check_out_status": "on_time",
      "attendance_status": "closed",
      "attendance_flags": [],
      "is_late": false,
      "is_early_leave": false,
      "work_duration": "9 jam 0 menit",
      "schedule": {
        "start_time": "08:00:00",
        "end_time": "17:00:00",
        "latitude": -6.2,
        "longitude": 106.8
      }
    },
    "today_state": "closed",
    "active_schedule": {
      "id": 20,
      "user_id": 1,
      "office_id": 1,
      "office_name": "HQ",
      "office_radius": 150,
      "shift_id": 1,
      "shift_name": "Shift A",
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "is_wfa": false,
      "is_banned": false
    },
    "this_month": [
      {
        "id": 10,
        "date": "2026-03-19",
        "start_time": "08:05:00",
        "end_time": "17:05:00",
        "check_in_status": "on_time",
        "check_out_status": "on_time",
        "attendance_status": "closed",
        "attendance_flags": []
      }
    ]
  }
}
```

### `GET /admin/api/v1/presensi/schedule`

Mengambil schedule aktif user.

Response `200`: object schedule seperti `active_schedule` di endpoint `attendance/today`.

Response umum:

- `422` tidak punya schedule aktif
- `403` schedule diblokir
- `422` schedule belum lengkap

### `POST /admin/api/v1/presensi/attendance/check-in`

Mencatat check-in.

Gunakan `multipart/form-data`.

Field:

- `latitude` required
- `longitude` required
- `photo` required, image max `10 MB`
- `is_mock_location` optional, boolean

Contoh:

```text
latitude=-6.2
longitude=106.8
photo=<image>
is_mock_location=false
```

Rule penting:

- user harus punya active schedule
- tidak boleh sedang cuti approved
- tidak boleh check-in dua kali di hari yang sama
- jika non-WFA, lokasi harus dalam radius office

Response sukses `201`:

```json
{
  "success": true,
  "message": "Check in recorded successfully.",
  "data": {
    "id": 10,
    "date": "2026-03-19",
    "start_time": "08:05:00",
    "end_time": null,
    "check_in_status": "on_time",
    "check_out_status": null,
    "attendance_status": "open",
    "attendance_flags": [],
    "is_late": false,
    "is_early_leave": false,
    "work_duration": "-",
    "schedule": {
      "start_time": "08:00:00",
      "end_time": "17:00:00",
      "latitude": -6.2,
      "longitude": 106.8
    }
  }
}
```

Response umum:

- `409` sudah check-in / presensi hari ini sudah selesai
- `403` jadwal diblokir
- `422` di luar radius
- `422` mock location
- `422` sedang cuti

### `POST /admin/api/v1/presensi/attendance/check-out`

Mencatat check-out untuk attendance aktif.

Gunakan `multipart/form-data`.

Field sama dengan check-in:

- `latitude`
- `longitude`
- `photo`
- `is_mock_location`

Rule penting:

- harus ada attendance aktif (`end_time` masih `null`)
- attendance terbuka dari hari sebelumnya akan ditolak dan harus diselesaikan admin
- jika non-WFA, lokasi harus dalam radius office
- status checkout dihitung otomatis dari perbandingan jam pulang vs jam schedule pada data attendance

### `GET /admin/api/v1/presensi/attendance/history/{month}/{year}`

Mengambil histori presensi per bulan.

Parameter URL:

- `month` `1..12`
- `year` `<= tahun sekarang`

Response `200`:

```json
{
  "success": true,
  "message": "Attendance retrieved successfully.",
  "data": [
    {
      "id": 10,
      "date": "2026-03-19",
      "start_time": "08:05:00",
      "end_time": "17:05:00",
      "check_in_status": "on_time",
      "check_out_status": "on_time",
      "attendance_status": "closed",
      "attendance_flags": []
    }
  ]
}
```

### `POST /admin/api/v1/presensi/schedule/ban`

Endpoint internal untuk memblokir schedule aktif.

Catatan:

- Bukan endpoint normal untuk employee mobile app
- Memerlukan permission `update_presensi_schedule`

### `GET /admin/api/v1/presensi/photo`

Mengambil URL avatar user saat ini.

Response `200`:

```json
{
  "success": true,
  "message": "Success get photo profile",
  "data": "https://example.com/avatar.jpg"
}
```

### `GET /admin/api/v1/presensi/leaves`

Mengambil daftar pengajuan leave.

Catatan:

- User biasa hanya melihat leave miliknya sendiri
- User dengan permission `view_any_presensi_leave` bisa melihat semua
- `data` bisa berupa array kosong dan itu normal

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 10,
      "type": "Cuti",
      "start_date": "2026-03-20T00:00:00.000000Z",
      "end_date": "2026-03-21T00:00:00.000000Z",
      "reason": "Acara keluarga",
      "status": "pending",
      "note": null,
      "attachment": null,
      "created_at": "2026-03-19T10:00:00.000000Z",
      "updated_at": "2026-03-19T10:00:00.000000Z"
    }
  ],
  "message": "Leaves retrieved successfully"
}
```

### `POST /admin/api/v1/presensi/leaves`

Membuat pengajuan leave.

Gunakan `multipart/form-data` bila mengirim file.

Field:

- `type`: `Izin`, `Sakit`, `Cuti`, `Lainnya`
- `start_date`
- `end_date`
- `reason`
- `file` optional, `jpg`, `jpeg`, `png`, `pdf`, max `10 MB`

Rule penting:

- `end_date >= start_date`
- tidak boleh overlap dengan leave `pending` atau `approved` milik user yang sama

### `GET /admin/api/v1/presensi/overtimes`

Mengambil daftar pengajuan overtime user saat ini.

Catatan:

- `data` bisa berupa array kosong dan itu normal

Response `200`:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 10,
      "date": "2026-03-19T00:00:00.000000Z",
      "start_time": "18:00:00",
      "end_time": "20:00:00",
      "reason": "Production support",
      "status": "pending",
      "note": null,
      "attachment": "presensi/attachments/evidence.pdf",
      "created_at": "2026-03-19T10:00:00.000000Z",
      "updated_at": "2026-03-19T10:00:00.000000Z"
    }
  ],
  "message": "Overtimes retrieved successfully"
}
```

### `POST /admin/api/v1/presensi/overtimes`

Membuat pengajuan overtime.

Gunakan `multipart/form-data` bila mengirim file.

Field:

- `date`
- `start_time` format `HH:MM` atau `HH:MM:SS`
- `end_time` format `HH:MM` atau `HH:MM:SS`
- `reason`
- `file` optional, `jpg`, `jpeg`, `png`, `pdf`, max `10 MB`

Rule penting:

- user harus punya schedule aktif
- user tidak boleh sedang cuti approved
- `end_time > start_time`
- overtime harus di luar jam kerja
- untuk tanggal lampau, harus ada attendance pada tanggal yang sama
- untuk tanggal lampau, jam overtime tidak boleh melewati attendance aktual
- tidak boleh overlap dengan overtime `pending` atau `approved`

---

## Catatan Implementasi Untuk Tim Mobile

- Jangan hardcode ID prioritas, status, unit, company, atau responsible helpdesk. Ambil dari `GET /helpdesk/meta`.
- Untuk helpdesk, gunakan `abilities` dari resource ticket untuk mengontrol tombol UI seperti `comment`, `close`, `cancel`, `reopen`, dan `assign_responsible`.
- Untuk helpdesk, render `responsible` sebagai nullable.
- Untuk presensi, tampilkan pesan server apa adanya untuk kasus operasional seperti di luar radius, jadwal diblokir, atau sedang cuti.
- Untuk presensi, perlakukan field status di response sebagai hasil perhitungan server, bukan sebagai field yang harus dikirim balik saat create/update.
- Untuk endpoint upload file/foto, kirim `multipart/form-data`.
- Untuk logout biasa gunakan `logout`; untuk ganti device/account penuh gunakan `logout-all`.
