# Algooly

## Tổng quan

Algooly là ứng dụng desktop Electron để xem thư viện thuật toán lập trình thi đấu và lưu lịch sử bài toán, ảnh chụp màn hình cùng lời giải trên máy. Lịch sử được lưu trong các thư mục thông thường; tính năng AI tùy chọn qua Gemini hoặc API tương thích OpenAI có thể đặt tên bài đã chụp. [Read the English README](README.md).

## Tính năng chính

- Tự xây dựng thư viện thuật toán (ví dụ C++ và Python) hoặc nhập gói thư viện (.zip). Ứng dụng bắt đầu với thư viện trống.
- Chụp toàn màn hình hoặc vùng chọn vào lịch sử bài toán cục bộ; thêm tệp lời giải, ảnh, liên kết, thẻ và verdict.
- Sắp xếp lịch sử bằng thư mục, đánh dấu bài đã giải hoặc yêu thích, xuất các thư mục/bài đã chọn thành ZIP để chia sẻ.
- Tùy chọn dùng Gemini hoặc API tương thích OpenAI để nhận diện thông tin bài, và ước lượng độ khó. Ứng dụng không tự chọn model AI: hãy tự chọn trong Cài đặt (nút `!` cạnh ô chọn model giải thích về gói dịch vụ và giới hạn rate limit).
- Chuyển giao diện giữa tiếng Anh, tiếng Việt và tiếng Nga.

## Cách hoạt động

Tiến trình chính của Electron xử lý chụp ảnh, lịch sử trên hệ thống tệp, tệp ZIP, yêu cầu mạng tùy chọn và tích hợp hệ điều hành. Renderer hiển thị thư viện và lịch sử; các preload script chỉ cung cấp một tập IPC giới hạn thay vì bật Node.js trong renderer.

Cấu trúc mã nguồn:

- `main.js`, `preload.js`, `notify-preload.js`, `region-preload.js`: tiến trình Electron và cầu nối preload.
- `renderer/`: giao diện, kiểu dáng, bản dịch và cửa sổ chụp ảnh/thông báo.
- `data/library.json`: thư viện mặc định; được phát hành ở trạng thái trống.
- `vendor/`: thư viện hiển thị và phông chữ được đóng gói.

Mặc định, lịch sử nằm trong `Algooly History` ở thư mục Documents của người dùng. Nếu thư mục `AlgoWiki History` cũ đã tồn tại và thư mục mới chưa có, ứng dụng tiếp tục dùng thư mục cũ. Có thể chọn thư mục lịch sử khác trong phần cài đặt. Cài đặt Electron, bao gồm nhà cung cấp AI, khóa API, model, base URL (với nhà cung cấp tương thích OpenAI) và thư mục lịch sử đã chọn, được lưu trong `config.json` thuộc thư mục `userData` của Electron; tùy chọn renderer dùng `localStorage` của trình duyệt. Trên Windows, ứng dụng giữ lại thư mục dữ liệu người dùng `%APPDATA%\algowiki` cũ để tương thích.

Mỗi bài toán được lưu trong một thư mục, ví dụ:

```text
2026-03-08/
└── 10h30 - Problem name/
    ├── meta.json
    ├── problem.png
    ├── problem-2.png
    └── solution.cpp
```

Ứng dụng tạo và cập nhật `meta.json`. Tùy theo bài toán và thao tác, tệp có thể chứa `createdAt`, `source` (`capture` hoặc `manual`), `aiAnalyzed`, `aiError`, `pending`, `site`, `title`, `pid`, `url`, `difficulty`, `rating`, `ratingEstimate`, `ratingConfidence`, `ratingEstimateStatus`, `ratingStatus`, `tags`, `solved`, `solvedAt`, `verdicts`, `star`, `parentId` và dữ liệu xoay ảnh (`imgRot`). Đây là các trường quan sát được trong mã, không phải lược đồ bên ngoài có phiên bản. Thư mục nhóm dùng `.algooly-group.json`; ứng dụng cũng nhận tên cũ `.algowiki-group.json`.

Chụp màn hình bắt đầu từ thao tác của người dùng, chẳng hạn phím tắt đã cấu hình hoặc lệnh trên khay hệ thống. Ảnh được lưu trong thư mục lịch sử cục bộ. Nếu bật tự động đặt tên và đã cấu hình khóa nhà cung cấp, ứng dụng có thể gửi ảnh chụp cùng câu lệnh đến nhà cung cấp đã chọn; xem [Quyền riêng tư và an toàn](#quyen-rieng-tu-va-an-toan).

Trong Coding History, nhấp chuột phải vào thư mục/bài đã chọn rồi chọn **Xuất mục đã chọn thành ZIP** để chia sẻ; các mục được chọn cùng được đưa vào tệp. Thư mục và bài dùng chung một lưới, mục mới nhất xuất hiện đầu tiên và có thể kéo thả để sắp xếp; kéo mục vào thư mục để chuyển mục đó vào bên trong. Tệp ZIP lịch sử chứa các tệp và bản tóm tắt `algooly-backup.json`. Khi nhập, ứng dụng bỏ các entry có thành phần đường dẫn không an toàn, bỏ thư mục bao ngoài được nhận diện, bỏ qua metadata bài toán không hợp lệ, xóa cờ `pending` trong metadata được nhập và tạo tên thư mục riêng nếu thư mục bài đã tồn tại. Việc lọc đường dẫn không đảm bảo mọi tệp lưu trữ đều an toàn; hãy kiểm tra bản sao lưu trước khi nhập.

Các nút **Nhập ZIP**, **Nhập thư mục** và xuất toàn bộ Coding History nằm tại **Cài đặt > Chung > Sao lưu Coding History**. Nhập thư mục hỗ trợ thư mục bài hoặc thư mục nhóm/lịch sử; ứng dụng sao chép vào thư mục lịch sử đã chọn và không ghi đè mục hiện có. Thư viện có các nút nhập/xuất ZIP riêng trong Cài đặt > Chung. Tên ZIP mặc định theo định dạng `DDMMYYYY__(HH_mm).zip` (ví dụ `21112026__(17_25).zip`).

## Yêu cầu, cài đặt và chạy

Theo thông tin từ maintainer, Windows là nền tảng hỗ trợ chính; mã nguồn tương thích ở mức mã nguồn với macOS và Linux. Runtime được nêu là Node.js LTS và Electron 33.4.11.

- **Người dùng cuối:** Tải file `.exe` đóng gói cho Windows từ [GitHub Releases](https://github.com/BillIsMe211/Algooly/releases) khi có bản phát hành.
- **Chạy từ mã nguồn:** Chạy `npm install`, sau đó `npx electron .`.

`package.json` được cung cấp không khai báo `scripts`, `engines` hoặc Electron là dependency. Vì vậy, chỉ chạy `npm install` sẽ không cài đặt hay cố định phiên bản Electron 33.4.11; hãy bảo đảm phiên bản đó có sẵn khi chạy `npx electron .`. Mục `electron@33.4.11` trong `allowScripts` không phải dependency hay npm script.

## Quyền riêng tư và an toàn

- Lịch sử bài toán, ảnh chụp, tệp lời giải và metadata được lưu cục bộ trong thư mục lịch sử đã chọn. Cài đặt và khóa API nhà cung cấp được lưu trong thư mục `userData` cục bộ của Electron. Bản sao lưu ZIP chứa dữ liệu lịch sử cục bộ ở dạng văn bản thuần; hãy bảo vệ chúng phù hợp.
- AI là tùy chọn. Gemini gửi khóa API trong header `x-goog-api-key` đến Generative Language API của Google; nhà cung cấp tương thích OpenAI dùng khóa bearer và base URL đã cấu hình. Tùy thao tác, yêu cầu có thể bao gồm ảnh bài toán (tối đa bốn ảnh, rộng tối đa 1.500 pixel, mã hóa JPEG chất lượng 85), câu lệnh nhận diện bài, tối đa 12.000 ký tự mã lời giải nếu không có ảnh đề. Google Search grounding của Gemini cũng có thể nhận tiêu đề bài, nền tảng, mã bài và phần tóm tắt đề tối đa 600 ký tự. Yêu cầu tạo nội dung timeout sau 25 giây; tìm model sau 15 giây; grounding sau 18 giây. Ứng dụng chỉ gửi các yêu cầu AI này khi tính năng AI tương ứng được chạy.
- Khóa được mã hóa bằng Electron `safeStorage` khi khả dụng. Nếu tính năng này không khả dụng hoặc mã hóa lỗi, khóa được lưu dạng văn bản thuần trong `config.json`. Hãy bảo vệ tài khoản người dùng và thư mục cấu hình; xóa khóa trong cài đặt nếu không muốn tiếp tục lưu.
- Khi khởi động, ứng dụng có thể tra cứu mã bài hoặc rating còn thiếu của bài Codeforces đã lưu qua API công khai của Codeforces. Yêu cầu dùng contest ID hoặc endpoint problemset công khai và timeout sau 12 hoặc 20 giây. Ứng dụng cũng kiểm tra trạng thái mạng cục bộ; không tìm thấy cơ chế telemetry, analytics hoặc tự động cập nhật trong mã nguồn được cung cấp.
- Chụp màn hình chỉ bắt đầu sau thao tác của người dùng và được lưu vào thư mục lịch sử. Ảnh clipboard chỉ được đọc khi người dùng yêu cầu thêm/dán ảnh. Hãy xem ZIP nhập vào, liên kết, ảnh, mã đã lưu và kết quả AI là dữ liệu không đáng tin cậy; ứng dụng không xác minh câu trả lời AI là chính xác.
- Cửa sổ chính bật context isolation và tắt Node integration, nhưng sandbox Electron bị tắt. HTML renderer có Content Security Policy, trong đó cửa sổ chính cho phép inline style. Preload chỉ cung cấp các kênh invoke và event trong allowlist; liên kết HTTP(S) được mở bên ngoài ứng dụng. Các biện pháp này giảm rủi ro nhưng không đảm bảo an toàn tuyệt đối.
- Nhập ZIP từ chối các thành phần đường dẫn giống traversal và kiểm tra entry, nhưng tệp trùng đường dẫn có thể ghi đè nhau và mã nguồn không giới hạn tổng dung lượng archive. Hãy kiểm tra archive không tin cậy và giữ bản sao lưu.

## Giấy phép

Metadata package khai báo giấy phép MIT cho Algooly. Xem [LICENSE](LICENSE).
