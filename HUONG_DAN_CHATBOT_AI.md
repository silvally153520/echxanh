# Hướng dẫn bật chatbot AI

Tài liệu này dành cho người cài đặt hoặc vận hành dự án sieuechxanh. Chatbot hỗ trợ khách tìm hiểu cách tìm chỗ nghỉ, đặt phòng, tài khoản và đơn đặt phòng.

## Chatbot hoạt động như thế nào?

Giao diện chat đã được tích hợp vào website. Khi khách gửi tin nhắn, frontend gọi API backend tại `/api/support/chat`; backend gửi nội dung đến OpenRouter và trả câu trả lời về website. Vì vậy, cần cấu hình API key ở **backend**, không phải ở trình duyệt.

Chatbot hiện chỉ trả lời dựa trên nội dung cuộc trò chuyện. Nó không đọc dữ liệu phòng, tình trạng còn chỗ, tài khoản, đơn đặt phòng, giao dịch hoặc chính sách riêng theo thời gian thực.

## Yêu cầu

- Node.js phiên bản 20 trở lên.
- Dự án đã cài đặt dependencies bằng `npm install` ở thư mục gốc.
- Một API key OpenRouter. Tạo tài khoản và key tại [openrouter.ai](https://openrouter.ai/).

Nhà cung cấp có thể áp dụng hạn mức, yêu cầu thanh toán hoặc thay đổi khả dụng của model. Hãy xem thông tin hiện hành trong tài khoản OpenRouter trước khi đưa chatbot vào sử dụng.

## Chạy chatbot ở môi trường local

1. Tạo file `server/.env` (nếu chưa có).
2. Thêm cấu hình:

   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=nvidia/nemotron-3.5-super-vl:free
   ```

   Thay `your_openrouter_api_key` bằng key của bạn. Model ở trên là model mặc định của dự án; nếu model không còn khả dụng, chọn model được OpenRouter hỗ trợ và cập nhật giá trị `OPENROUTER_MODEL`.

3. Khởi động ứng dụng từ thư mục gốc:

   ```bash
   npm run dev
   ```

4. Mở website tại `http://localhost:5173`, chọn **Hỗ trợ** và gửi câu hỏi thử.

Backend cũng chấp nhận biến `OPENAI_API_KEY` làm tên thay thế cho `OPENROUTER_API_KEY`, nhưng kết nối hiện tại vẫn dùng API tương thích OpenRouter. Nên dùng tên `OPENROUTER_API_KEY` để cấu hình rõ ràng.

## Cấu hình khi deploy

Trong phần **Environment Variables**, **Environment**, hoặc **Secrets** của dịch vụ backend, thêm:

| Tên biến | Giá trị |
| --- | --- |
| `OPENROUTER_API_KEY` | API key riêng tư từ OpenRouter |
| `OPENROUTER_MODEL` | Model được OpenRouter hỗ trợ; nếu bỏ trống, dự án dùng model mặc định |

Lưu biến môi trường và deploy/restart backend. Không cần thêm API key vào frontend. Nếu frontend và backend chạy ở các địa chỉ khác nhau, frontend cần được cấu hình với URL backend qua `VITE_API_URL`, còn backend cần cho phép URL frontend qua `FRONTEND_URL`.

## Bảo vệ API key

- Không đặt key trong mã nguồn, file frontend, biến bắt đầu bằng `VITE_`, ảnh chụp màn hình hoặc tài liệu công khai.
- Không commit file `server/.env`. File này đã được liệt kê trong `.gitignore`.
- Trên môi trường deploy, lưu key bằng hệ thống quản lý secrets của nhà cung cấp.
- Nếu key bị lộ, thu hồi key đó trong OpenRouter và tạo key mới.

## Kiểm tra và xử lý sự cố

- **“Trợ lý AI chưa được cấu hình”**: kiểm tra `OPENROUTER_API_KEY` trong môi trường backend, sau đó restart/redeploy dịch vụ.
- **AI không kết nối được hoặc gặp sự cố**: kiểm tra log backend, trạng thái dịch vụ OpenRouter, hạn mức tài khoản và giá trị `OPENROUTER_MODEL`.
- **Chat không gửi được câu hỏi**: kiểm tra backend đang chạy, `VITE_API_URL` trỏ đúng API, và `FRONTEND_URL` trên backend khớp với địa chỉ website.
- **Câu trả lời chưa chính xác**: chatbot có thể trả lời sai; không dùng câu trả lời AI làm xác nhận về chỗ còn phòng, giá hiện tại, giao dịch hoặc trạng thái đặt phòng. Khách cần kiểm tra thông tin trên website hoặc liên hệ kênh hỗ trợ chính thức.

Ứng dụng giới hạn mỗi tin nhắn tối đa 1.000 ký tự, tối đa 10 tin nhắn trong một yêu cầu và có giới hạn tốc độ cho API chat.
