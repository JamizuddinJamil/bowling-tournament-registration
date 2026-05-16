👤 PANDUAN PENGGUNA (PESERTA)
🟢 1. Cara Mendaftar

Buka laman utama:

index.html

atau link Netlify yang diberikan

Klik butang “Register Now” / “Daftar”
Isi borang pendaftaran:
Nama penuh
No. IC / ID (jika diperlukan)
No. telefon
Team / kategori (jika ada)
Maklumat lain yang diminta
Semak semula maklumat sebelum hantar
Klik Submit
💳 2. Pembayaran (DuitNow QR)
Selepas submit borang, scan QR DuitNow yang dipaparkan
Buat pembayaran (jika yuran dikenakan)
Simpan resit sebagai bukti (jika diminta admin)
🔍 3. Semak Status Pendaftaran

Pergi ke:

status.html
Masukkan:
Nama / IC / ID (bergantung sistem)
Klik Check Status
Status akan dipaparkan:
🟡 PENDING → menunggu kelulusan admin
🟢 APPROVED → berjaya didaftarkan
🔴 REJECTED → tidak berjaya / perlu daftar semula
⚠️ Nota Penting Peserta
Pastikan maklumat tepat sebelum hantar
Jangan daftar dua kali (kecuali diminta)
Simpan nombor rujukan / info pendaftaran
🛠️ PANDUAN ADMIN
🔐 1. Login Admin

Pergi ke:

admin-login.html
Masukkan:
Username
Password
Klik Login

Default (WAJIB tukar dalam config.js):

Username: admin
Password: P@ssw0rd
📊 2. Dashboard Admin

Selepas login, admin akan masuk ke:

admin.html

Fungsi utama:

Lihat semua pendaftaran peserta
Semak status (PENDING / APPROVED / REJECTED)
Urus senarai peserta
✅ 3. Proses Kelulusan Peserta

Dalam dashboard:

➤ Untuk setiap peserta:
Klik Approve → peserta disahkan berjaya
Klik Reject → peserta ditolak
Status akan auto-update dalam database Supabase
🔄 4. Aliran Kerja Admin
Peserta daftar
      ↓
Masuk database (PENDING)
      ↓
Admin login
      ↓
Semak senarai peserta
      ↓
Approve / Reject
      ↓
Status dikemaskini
      ↓
Peserta semak status di status.html
⚠️ Nota Penting Admin
Sentiasa semak data sebelum approve
Jangan biarkan semua peserta PENDING terlalu lama
Tukar password default sebelum deploy live
Pastikan Supabase connection stabil
🧠 Best Practice (Disarankan)
Approve ikut batch (contoh: 50 orang sekali gus)
Export data peserta sebelum hari event
Semak duplicate entry secara berkala
🏁 Ringkasan Flow Sistem
PESERTA → Register → PENDING (Supabase)
                     ↓
                 ADMIN CHECK
                     ↓
          APPROVE / REJECT
                     ↓
PESERTA CHECK STATUS → RESULT DISPLAY
