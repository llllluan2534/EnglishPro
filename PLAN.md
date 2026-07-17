Để xây dựng một Hệ thống Quản trị (CMS) cho Giáo viên trong ứng dụng học Tiếng Anh, chúng ta phải thiết kế dữ liệu thật "chuẩn" vì nội dung sẽ chứa chữ, hình ảnh, file audio (nghe), video và hệ thống ngân hàng câu hỏi đồ sộ.

Tôi đề xuất theo một lộ trình 5 Giai đoạn tối ưu nhất, đi từ "Móng" (Công cụ) lên "Đỉnh" (Phân tích Data).

🟢 Giai đoạn 1: Công Cụ Cốt Lõi (Core Tools)
Không thể bắt đầu soạn bài nếu không có công cụ gõ văn bản chuẩn.

Rich Text Editor (Trình soạn thảo văn bản đa phương tiện):
Tích hợp thư viện TipTap (Headless Editor) để làm bộ gõ chữ giống hệt Microsoft Word/Notion.
Giáo viên có thể in đậm, in nghiêng, bôi màu highlight từ vựng, chèn Link.
Hệ thống Upload File đám mây (Cloud Storage):
Sử dụng Cloudflare R2 (vì ông đã có sẵn trên file .env) để làm API upload Ảnh (cho hình Flashcard) và Audio (cho bài nghe Listening, phát âm).
🟡 Giai đoạn 2: Quản lý Cấu trúc Chương Trình (Topics & Lessons)
Xây dựng bộ khung xương lưu trữ bài giảng.

Topic Manager (Quản lý Chủ đề/Khóa học):
Giao diện CRUD (Thêm, Sửa, Xóa) cho các Chủ đề theo từng khối lớp (VD: Lớp 10, Lớp 11).
Lesson Builder (Soạn bài học):
Ứng dụng RichTextEditor ở giai đoạn 1 vào đây để thầy cô tự do biên tập lý thuyết ngữ pháp/từ vựng kèm hình ảnh trực quan.
🟠 Giai đoạn 3: Ngân Hàng Câu Hỏi (Question & Flashcard Bank)
Giai đoạn khó nhất và là cốt lõi tạo nên sự tương tác của học sinh.

Question Builder (Máy tạo Câu hỏi): Một giao diện linh hoạt hỗ trợ sinh nhiều định dạng:
Multiple Choice (Trắc nghiệm): Chọn đáp án đúng A,B,C,D.
Fill in the Blank (Điền khuyết): Nhập chữ vào ô trống trường từ vựng.
Audio Speaking (Thu âm phát âm AI): Cấu hình câu nói mẫu, dùng API Whisper để chấm điểm giọng đọc học sinh.
Flashcard System:
Tạo thẻ Flashcard theo bộ (Gồm Front: ảnh+phát âm, Back: Nghĩa tiếng Việt).
🔴 Giai đoạn 4: Lắp Ráp Bộ Đề Kiểm Tra (Exam System)
Không gõ lại câu hỏi, chỉ nhặt từ Ngân hàng để thả vào Đề thi.

Bộ chắp ghép Đề (Assembly Tool):
Tính năng Kéo & Thả (Drag & Drop) để nhặt câu hỏi từ Ngân hàng tống vào 1 Bộ Đề.
Bảng điều khiển setup: Thời gian làm bài (ví dụ 60 phút), số câu hỏi, cách tính điểm số cho từng câu, ngày giờ được phép mở đề thi.
🟣 Giai đoạn 5: Dashboard Báo Cáo (Analytics & Insights)
Biển thủ thông tin để giáo viên theo dõi.

Bỏ dữ liệu tĩnh ở trang /teacher/dashboard và kết nối Prisma để lấy dữ liệu Report tự động.
Dùng biểu đồ Recharts để dựng Dashboard quan sát: Tỉ lệ học sinh làm xong bài tập, Số điểm trung bình kiểm tra, Top học sinh lười/chăm chỉ nhất lớp.