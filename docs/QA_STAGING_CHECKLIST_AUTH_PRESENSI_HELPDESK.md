# QA Staging Checklist: Auth, Presensi, Helpdesk

Dokumen ini dipakai untuk smoke test, regression test, dan UAT staging pada flow mobile yang paling kritikal:

- `Auth`
- `Presensi`
- `Helpdesk`

Target dokumen ini adalah memastikan fitur bukan hanya lolos compile/test, tetapi juga benar-benar usable dengan backend staging dan perangkat nyata.

## Scope

Dalam scope:

- Login, restore session, logout, logout-all, session expired
- Dashboard presensi, riwayat, check-in, check-out, leave, overtime, reminder
- Helpdesk list, filter, detail, create, edit, attachment, comment, status transition

Di luar scope:

- Payroll
- Employee directory
- Push notification end-to-end selain reminder presensi lokal

## Test Matrix Minimum

Jalankan minimal pada:

- 1 Android device fisik
- 1 iPhone fisik
- 1 akun user biasa
- 1 akun user yang punya akses helpdesk internal/handler
- 1 akun yang punya akses company lebih dari satu bila backend mendukung

## Pre-Test Setup

Pastikan data staging tersedia:

- Akun aktif dengan kredensial valid
- Akun nonaktif
- Akun dengan password salah untuk negative test
- User dengan schedule presensi aktif
- User tanpa schedule aktif
- User dengan schedule `is_wfa = true`
- User dengan leave approved hari ini
- Ticket helpdesk status `Open`
- Ticket helpdesk status `In Progress`
- Ticket helpdesk status `Closed`
- Ticket dengan attachment file
- Ticket legacy yang `description` mengandung HTML/link inline

## Exit Criteria

Skenario dianggap lulus bila:

- Tidak ada crash
- Tidak ada blank screen
- Tidak ada request loop atau freeze
- Error message operasional tampil jelas ke user
- Data yang tampil setelah mutation sesuai state backend terbaru
- Session/token tidak tertinggal saat logout atau `401`

## Auth

### A. Login

- Buka app dari kondisi fresh install
- Pastikan bottom sheet login muncul saat membuka halaman yang butuh auth
- Login dengan kredensial valid
- Verifikasi user masuk ke flow normal tanpa perlu reload app
- Tutup app, buka lagi, pastikan session masih pulih

Expected:

- Token tersimpan
- User profile termuat
- Tidak ada error toast/alert yang salah

### B. Login Failure

- Coba email/password salah
- Coba akun nonaktif
- Coba device offline / server tidak reachable
- Coba spam login sampai kena rate limit bila bisa disimulasikan

Expected:

- Pesan error sesuai kasus
- App tidak stuck loading
- Tidak ada token/session tersimpan saat login gagal

### C. Restore Session

- Login sukses
- Kill app
- Buka ulang app
- Matikan internet lalu buka ulang app setelah pernah login

Expected:

- Jika token valid, session pulih
- Jika server gagal tapi cache user ada, app tetap bisa masuk dengan notice yang sesuai
- Jika token invalid/expired, user dipaksa login lagi

### D. Logout

- Dari keadaan login, jalankan logout biasa
- Login lagi, jalankan logout all

Expected:

- Token dan cache user terhapus
- Protected screen kembali minta login
- Session lama tidak otomatis aktif lagi

### E. Session Expired / 401

- Pakai token expired atau revoke token dari backend saat app masih terbuka
- Lakukan request protected berikutnya

Expected:

- App membersihkan session lokal
- User dikeluarkan ke state unauthenticated
- Bottom sheet login muncul kembali

## Presensi

### A. Dashboard Presensi

- Login sebagai user dengan schedule aktif
- Buka halaman presensi
- Verifikasi jadwal, jam shift, history bulan berjalan, dan tombol aksi tampil

Expected:

- Tidak ada blank state yang salah
- Data schedule dan today state sesuai backend

### B. Schedule Edge Cases

- User tanpa schedule aktif
- User schedule diblokir
- User WFA
- User non-WFA

Expected:

- Pesan error/state sesuai
- Flow tetap usable

### C. Permission Flow

- Tolak izin kamera
- Tolak izin lokasi
- Izinkan keduanya lalu ulangi

Expected:

- User diberi pesan yang benar
- Tidak ada crash
- Flow bisa lanjut setelah permission diizinkan

### D. Location Validation

- Uji di dalam radius office
- Uji di luar radius office
- Uji lokasi belum terbaca / GPS lambat
- Uji WFA yang seharusnya lolos tanpa radius office

Expected:

- Dalam radius bisa lanjut ke kamera
- Di luar radius tertahan dengan pesan yang benar
- WFA tidak tertahan oleh radius

### E. Check-In

- User valid, schedule aktif, lokasi valid, ambil selfie, submit check-in
- Ulangi check-in kedua kali di hari yang sama
- Coba check-in saat user sedang leave approved

Expected:

- Check-in pertama sukses
- Check-in kedua ditolak dengan pesan backend
- User leave approved ditolak
- Dashboard ter-refresh dan status hari ini berubah

### F. Check-Out

- Lakukan check-out setelah check-in sukses
- Coba check-out tanpa check-in
- Coba check-out saat attendance lama bermasalah bila data tersedia

Expected:

- Check-out valid sukses
- Check-out tanpa check-in ditolak sebelum submit
- Setelah sukses, history dan state hari ini ter-refresh

### G. Leave Request

- Submit leave tanpa file
- Submit leave dengan file
- Submit tanggal tidak valid
- Submit overlap dengan leave existing

Expected:

- Request valid sukses
- Request invalid menampilkan pesan yang benar
- List leave ter-refresh

### H. Overtime Request

- Submit overtime tanpa file
- Submit overtime dengan file
- Submit `end_time <= start_time`
- Submit overtime yang overlap

Expected:

- Request valid sukses
- Request invalid menampilkan pesan yang benar
- List overtime ter-refresh

### I. Reminder Settings

- Ubah menit reminder
- Masukkan nilai di bawah minimum
- Masukkan nilai di atas maksimum
- Tolak izin notifikasi

Expected:

- Nilai valid tersimpan
- Nilai invalid ditolak
- App tidak crash saat permission notifikasi ditolak

## Helpdesk

### A. List & Filter

- Buka inbox helpdesk
- Verifikasi box `incoming/outgoing/all` sesuai role
- Uji search
- Uji filter priority, status, unit, category, responsible
- Uji pagination / load next page

Expected:

- List tampil sesuai query
- Counter box sesuai
- Filter reset berfungsi
- Next page memuat data berikutnya tanpa duplikasi

### B. Detail Ticket

- Buka ticket `Open`, `In Progress`, `Closed`
- Verifikasi badge status, priority, owner, responsible, company, history, comments
- Verifikasi attachment existing dapat dibuka
- Verifikasi ticket legacy dengan HTML/link inline tampil dengan baik

Expected:

- Detail tidak kosong
- HTML description/comment tetap readable
- Link/attachment dapat dibuka

### C. Create Ticket

- Buat ticket tanpa attachment
- Buat ticket dengan attachment
- Coba submit tanpa field wajib
- Coba category yang tidak sesuai unit bila backend memungkinkan

Expected:

- Ticket valid sukses dan redirect ke detail
- Validation error tampil jelas

### D. Edit Ticket

- Edit ticket `Open`
- Ganti title/description
- Tambah attachment baru
- Hapus attachment lama lalu simpan
- Simpan ticket legacy tanpa mengubah description
- Simpan ticket legacy setelah mengubah description

Expected:

- Perubahan tersimpan
- Attachment retained/removed sesuai pilihan
- Description tidak rusak saat save ulang

### E. Comment

- Tambah public comment tanpa attachment
- Tambah public comment dengan attachment
- Tambah internal note sebagai handler
- Verifikasi owner tidak bisa membuat internal note

Expected:

- Comment muncul di detail terbaru
- Visibility sesuai role
- Attachment comment dapat dibuka

### F. Status Transition

- `Open -> In Progress`
- `Open -> Cancelled`
- `In Progress -> Closed`
- `Closed -> Open` dengan alasan reopen

Expected:

- Tombol action muncul sesuai `abilities`
- Reason mandatory saat dibutuhkan
- Detail ticket dan history langsung ter-update

### G. Delete Ticket

- Hapus ticket yang diizinkan
- Verifikasi redirect kembali ke inbox

Expected:

- Ticket hilang dari list
- Tidak bisa dibuka lagi dari cache lama

## Regression Risks Yang Wajib Dicek Lagi Setelah Backend Update

- Shape response helpdesk detail: `{ data: ticket }` vs bare ticket
- Rich text HTML pada `description` dan `comment`
- `existing_supporting_attachments[]` saat edit ticket
- Schedule presensi yang koordinat officenya tidak lengkap
- Error `401` global yang harus membersihkan session

## Bug Report Format

Gunakan format ini saat menemukan issue:

- Feature:
- Screen/Route:
- Akun:
- Device/OS:
- Preconditions:
- Steps to Reproduce:
- Expected Result:
- Actual Result:
- API Response / Error Message:
- Screenshot / Screen Recording:
- Severity:

## Rekomendasi Sign-Off

Jangan rilis production bila salah satu dari ini gagal:

- Login valid tidak konsisten
- Session expired tidak membersihkan auth
- Check-in atau check-out gagal pada happy path
- Create/edit/comment helpdesk gagal pada happy path
- Attachment helpdesk tidak bisa retain/remove saat edit
- App crash pada permission deny, offline, atau `401`
