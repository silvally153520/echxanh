# Triển khai Cloudflare Pages + Render

Frontend React/Vite chạy trên Cloudflare Pages. API Express và Prisma chạy trên Render; PostgreSQL có thể dùng Supabase như cấu hình trong `server/.env.example`.

## 1. Chuẩn bị PostgreSQL

Tạo project PostgreSQL trên Supabase. Lấy các connection string theo hướng dẫn trong `server/.env.example`. `DATABASE_URL` nên dùng Session pooler; `DIRECT_URL` dùng kết nối trực tiếp hoặc Session pooler nếu môi trường không truy cập được direct host.

## 2. Triển khai API trên Render

1. Đẩy repository lên GitHub/GitLab.
2. Trong Render, chọn **New > Blueprint** và kết nối repository. Render sẽ đọc `render.yaml`.
3. Khi được yêu cầu, nhập `DATABASE_URL`, `DIRECT_URL` và `FRONTEND_URL`. Tạm thời có thể dùng URL `pages.dev`; sau khi gắn domain riêng, cập nhật `FRONTEND_URL` thành đúng origin của giao diện.
4. Chờ deploy xong, ghi lại URL API Render, ví dụ `https://sieuechxanh-api.onrender.com`.
5. Mở **Shell** của service và chạy một lần:

   ```sh
   npm run db:push --workspace=server
   ```

`JWT_SECRET` và `JWT_REFRESH_SECRET` được Render tạo tự động. Thêm các biến email (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`) nếu cần gửi email. Thêm biến Cloudinary nếu cần chức năng ảnh cần Cloudinary.

Gói Render miễn phí có thể sleep khi không có truy cập và khởi động lại chậm ở request đầu tiên.

## 3. Triển khai giao diện trên Cloudflare Pages

1. Trong Cloudflare Dashboard, chọn **Workers & Pages > Create > Pages > Connect to Git**.
2. Chọn repository và cấu hình build:
   - **Root directory**: `/` (repository root)
   - **Build command**: `npm run build:client`
   - **Build output directory**: `client/dist`
3. Thêm biến môi trường cho **Production**:
   - `VITE_API_URL` = `https://<URL-API-RENDER>/api`
4. Deploy và ghi lại URL giao diện Pages.
5. Cập nhật biến `FRONTEND_URL` trong Render thành URL giao diện chính xác, rồi deploy lại API.

Mỗi lần thay đổi `VITE_API_URL`, cần build/deploy lại Pages vì biến này được nhúng vào frontend lúc build.

## 4. Domain và cookie đăng nhập

API hiện xác thực bằng cookie. Tên miền mặc định `*.pages.dev` và `*.onrender.com` là hai site khác nhau; trình duyệt có thể chặn cookie bên thứ ba, khiến đăng nhập/duy trì phiên không ổn định. Để dùng production đáng tin cậy, gắn domain riêng cho Pages (ví dụ `www.example.com`) và API Render (ví dụ `api.example.com`), sau đó đặt:

- Cloudflare Pages `VITE_API_URL` = `https://api.example.com/api`
- Render `FRONTEND_URL` = `https://www.example.com`

Sau khi đổi biến, deploy lại cả frontend lẫn backend. Không đặt `FRONTEND_URL` thành URL có dấu `/` ở cuối.

## Kiểm tra

- Mở `https://<URL-API-RENDER>/api/health`; kết quả cần có `"status":"ok"` và `"database":"connected"`.
- Truy cập URL Pages, kiểm tra trang chủ và đăng nhập sau khi đã cấu hình domain phù hợp.
