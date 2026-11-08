# Đăng nhập bằng email/mật khẩu

**Status:** ready-for-agent

**Progress:** implementing — chưa hoàn thành tính năng.

## Tiến độ triển khai

`Status` là nhãn triage, không phải trạng thái hoàn thành. Checkbox trong ticket ghi nhận phần đã triển khai/kiểm tra tĩnh; không khẳng định đã QA hành vi trên Firebase. Review toàn nhánh sẽ chạy một lần sau khi triển khai hết, theo yêu cầu người dùng.

| Ticket | Triển khai | Kiểm tra tĩnh | Review | QA tay | Commit |
| --- | --- | --- | --- | --- | --- |
| 01 | Đã triển khai | Pass | Chờ review toàn nhánh | Chưa chạy | `fa11552` |
| 02 | Đã triển khai | Pass | Chờ review toàn nhánh | Chưa chạy | `6aa60bf` |
| 03 | Đã triển khai | Pass | Chờ review toàn nhánh | Chưa chạy | `9c7fa8c` |
| 04 | Đang triển khai | Chưa chạy | Chưa review | Chưa chạy | Chưa commit |
| 05 | Chưa triển khai | Chưa chạy | Chưa review | Chưa chạy | — |
| 06 | Chưa triển khai | Chưa chạy | Chưa review | Chưa chạy | — |
| 07 | Chưa triển khai | Chưa chạy | Chưa review | Chưa chạy | — |

README được giữ nguyên theo lựa chọn mới của người dùng, thay thế yêu cầu cập nhật README bên dưới và trong ticket 07.

## Problem Statement

CineMOB hiện chỉ cho phép đăng nhập bằng Google. Người dùng không có tài khoản Google, hoặc không muốn phụ thuộc vào Google, không thể tạo tài khoản hay sử dụng ứng dụng. Rào cản này nằm ngay ở bước đầu tiên và thu hẹp tệp người dùng tiềm năng.

## Solution

Bổ sung phương thức đăng nhập email/mật khẩu đầy đủ: đăng ký, đăng nhập, quên mật khẩu, xác minh email, liên kết/gỡ liên kết với Google, thêm/đổi mật khẩu. Email/mật khẩu là form chính trên màn hình đăng nhập; Google vẫn là lựa chọn phụ một chạm. Tài khoản email/mật khẩu phải xác minh email trước khi được dùng app. Việc liên kết tài khoản chỉ diễn ra sau khi người dùng xác thực bằng phương thức đã tồn tại; không tự động gộp tài khoản chỉ vì trùng email.

## User Stories

1. Là người dùng mới không có Google, tôi muốn tạo tài khoản bằng email/mật khẩu để dùng được CineMOB.
2. Là người dùng mới, tôi muốn nhập tên hiển thị khi đăng ký để hồ sơ thành viên của tôi dễ nhận ra.
3. Là người dùng mới, tôi muốn thấy yêu cầu mật khẩu trước khi gửi form để biết mật khẩu nào được chấp nhận.
4. Là người dùng mới, tôi muốn hiện/ẩn mật khẩu và nhập lại mật khẩu để tránh gõ sai.
5. Là người dùng mới, tôi muốn nhận email xác minh ngay sau khi đăng ký để chứng minh tôi sở hữu địa chỉ đó.
6. Là người dùng chưa xác minh, tôi muốn có màn hình xác minh rõ ràng để biết bước tiếp theo.
7. Là người dùng chưa xác minh, tôi muốn gửi lại email và kiểm tra lại để không bị kẹt.
8. Là người dùng chưa xác minh, tôi muốn đăng xuất để đổi tài khoản.
9. Là người dùng chưa xác minh, tôi muốn bị chặn khỏi dữ liệu app để tài khoản chưa xác minh không chiếm được email hay tạo dữ liệu.
10. Là người dùng email quay lại, tôi muốn đăng nhập bằng email/mật khẩu.
11. Là người dùng quên mật khẩu, tôi muốn yêu cầu link đặt lại mật khẩu ngay từ màn hình đăng nhập.
12. Là người dùng yêu cầu đặt lại mật khẩu, tôi muốn app không tiết lộ email nào đã đăng ký.
13. Là người dùng Google, tôi muốn tiếp tục đăng nhập một chạm như trước.
14. Là người dùng Google, tôi muốn thêm mật khẩu để có thể đăng nhập mà không cần Google.
15. Là người dùng email, tôi muốn liên kết Google để đăng nhập bằng cả hai cách.
16. Là người dùng đang liên kết Google, tôi muốn app từ chối tài khoản Google có email khác để tài khoản không có hai email khác nhau.
17. Là người dùng có cả hai phương thức, tôi muốn thấy phương thức nào đã liên kết và liên kết với email nào.
18. Là người dùng có cả hai phương thức, tôi muốn gỡ một phương thức miễn là còn phương thức khác.
19. Là người dùng, tôi muốn app chặn gỡ phương thức đăng nhập cuối cùng để tôi không tự khóa mình.
20. Là người dùng thực hiện thao tác nhạy cảm, tôi muốn được yêu cầu xác thực lại khi Firebase yêu cầu.
21. Là người dùng có mật khẩu, tôi muốn đổi mật khẩu bằng cách nhập mật khẩu hiện tại.
22. Là người dùng thử Google với email đã có tài khoản mật khẩu, tôi muốn được hướng dẫn đăng nhập bằng mật khẩu rồi liên kết Google, không tự động gộp tài khoản.
23. Là người dùng thử email/mật khẩu với email chỉ có tài khoản Google, tôi muốn được gợi ý dùng Google.
24. Là người dùng, tôi muốn thông báo lỗi tiếng Việt rõ ràng cho sai thông tin, mật khẩu yếu, quá nhiều lần thử, mất mạng, popup bị chặn và phiên đăng nhập hết hạn.
25. Là người dùng, tôi muốn chuyển giữa đăng nhập, tạo tài khoản và quên mật khẩu mà không mất ngữ cảnh.
26. Là người dùng di động, tôi muốn màn hình đăng nhập và trang tài khoản hoạt động tốt trên màn hình nhỏ.
27. Là người dùng, tôi muốn mở trang tài khoản & bảo mật từ menu tài khoản.
28. Là người dùng, tôi muốn được xác nhận trước khi gỡ liên kết một phương thức.
29. Là người dùng, tôi muốn app tự kiểm tra lại trạng thái xác minh khi tôi quay lại tab.
30. Là người dùng Google hiện tại, tôi muốn thư viện, hồ sơ và luồng đăng nhập của tôi không thay đổi.

## Implementation Decisions

- **Phương thức đăng nhập**: giữ Google; thêm email/mật khẩu. Màn hình auth có ba chế độ: Đăng nhập, Tạo tài khoản, Quên mật khẩu. Email/mật khẩu là form chính; Google là nút phụ dưới divider "hoặc".
- **Đăng ký**: trường tên hiển thị (2–50 ký tự, dùng validation hiện có), email, mật khẩu, nhập lại mật khẩu. Mật khẩu tối thiểu 8 ký tự, có ít nhất một chữ và một số. Có hiện/ẩn; nhập lại phải khớp. Sau khi tạo tài khoản, cập nhật tên hiển thị, gửi email xác minh và đưa người dùng đến gate xác minh.
- **Thời điểm tạo tài khoản**: Firebase Auth tạo user ngay khi đăng ký với `emailVerified = false`; link xác minh chỉ đổi cờ này. Không có cơ chế tạo user sau khi xác minh cho email/mật khẩu. App chặn quyền dùng app đến khi xác minh.
- **Gate xác minh**: full-page, hiển thị email đang chờ xác minh; nút gửi lại (có cooldown), "Tôi đã xác minh" (reload + force refresh token), đăng xuất; tự kiểm tra khi quay lại tab. Phần khởi tạo dữ liệu app chỉ chạy sau khi verified để không tạo dữ liệu Firestore cho tài khoản chưa xác minh.
- **Đăng nhập**: email/mật khẩu; lỗi sai thông tin dùng thông điệp chung, kèm gợi ý dùng Google nếu phù hợp; tài khoản chưa xác minh vào gate.
- **Quên mật khẩu**: gửi link đặt lại qua email; luôn hiển thị thông điệp chung "Nếu email tồn tại..."; quay lại đăng nhập.
- **Xác minh email**: gửi email xác minh; Firestore rules yêu cầu `request.auth.token.email_verified == true` cho create/update trên các collection thuộc người dùng (`movies`, `albums`, `member_profiles`, `member_lookup`, `users`, `push_subscriptions`). Đọc giữ nguyên. Force refresh token sau khi xác minh để token có claim mới.
- **Liên kết tài khoản**: không auto-link. Khi gặp `auth/account-exists-with-different-credential`, giữ pending credential, yêu cầu đăng nhập bằng phương thức đã tồn tại, rồi `linkWithCredential`. Nếu tài khoản hiện có chưa xác minh, yêu cầu xác minh trước rồi liên kết trong trang bảo mật.
- **Email enumeration protection**: giữ bật; không dùng `fetchSignInMethodsForEmail`; UI hỏi người dùng chọn phương thức khi cần.
- **Trang Tài khoản & bảo mật**: route riêng, link từ menu tài khoản. Hiển thị email tài khoản và các phương thức đã liên kết. Hành động: kết nối Google, thêm mật khẩu, đổi mật khẩu, gỡ liên kết. Khi kết nối Google, nếu email Google khác email tài khoản thì hủy liên kết và báo lỗi. Khi gỡ liên kết, yêu cầu còn ít nhất một phương thức, xác nhận, và reauth nếu cần. Không cho gỡ phương thức đăng nhập cuối cùng.
- **Reauth**: xử lý `auth/requires-recent-login` bằng reauth mật khẩu hoặc Google tùy phương thức đang có; sau đó tiếp tục hành động.
- **Đổi/thêm mật khẩu**: nếu đã có mật khẩu, yêu cầu mật khẩu hiện tại để reauth rồi `updatePassword`. Nếu chỉ có Google, dùng `linkWithCredential` với email tài khoản và mật khẩu mới. Validate mật khẩu mới như đăng ký.
- **Lỗi**: hàm map mã lỗi Firebase sang thông điệp tiếng Việt theo COPY.md; bao phủ các mã thường gặp: `invalid-email`, `weak-password`, `email-already-in-use`, `invalid-credential`, `too-many-requests`, `network-request-failed`, `popup-closed-by-user`, `popup-blocked`, `account-exists-with-different-credential`, `requires-recent-login`, `provider-already-linked`, `credential-already-in-use`, `user-disabled`, `operation-not-allowed`.
- **Cấu trúc module**: giữ AuthProvider cho state; tách service xử lý Firebase Auth và các hàm thuần cho validate/map lỗi; hook riêng cho trang bảo mật. Không over-abstract.
- **Avatar**: giữ fallback chữ cái đầu hiện có; ẩn "Khôi phục ảnh đại diện Google" với tài khoản không có Google.
- **Copy & thiết kế**: theo COPY.md và DESIGN.md; dùng component hiện có; CTA "Tạo tài khoản", "Đăng nhập", "Gửi email đặt lại mật khẩu"...
- **Tài liệu**: cập nhật README mô tả auth (Google + email/mật khẩu). Không tạo tài liệu QA/triển khai.
- **Không dọn tài khoản chưa xác minh**: giữ hành vi chuẩn của Firebase; chủ email thật dùng "Quên mật khẩu" để tiếp quản.

## Testing Decisions

- Không thêm test runner.
- Kiểm tra tĩnh: `npm run typecheck`, `npm run lint`, `npm run build`.
- QA tay do người dùng tự thực hiện; không đưa checklist QA vào tài liệu.
- Các hàm validate/map lỗi được tách riêng để dễ đọc, nhưng không có automated tests trong phạm vi này.

## Out of Scope

- Đổi email.
- Xóa tài khoản.
- MFA.
- Auto-link tài khoản trùng email.
- Dọn tài khoản chưa xác minh tự động.
- Đăng xuất khỏi mọi thiết bị.
- Provider khác ngoài Google.
- Chế độ khách/anonymous.
- Checkbox điều khoản/privacy.
- Tùy chỉnh email template trong code (là bước cấu hình Firebase Console).

## Further Notes

- **Firebase Console (bước con người)**: bật Email/Password; giữ "Link accounts that use the same email"; giữ email enumeration protection ON; thêm authorized domains; tùy chỉnh email xác minh/đặt lại mật khẩu bằng tiếng Việt.
- **Giới hạn đã biết**: gõ sai email lúc đăng ký thì không có luồng đổi email; người dùng phải tạo tài khoản mới bằng email đúng. Tài khoản chưa xác minh cũ vẫn tồn tại; chủ email thật có thể đặt lại mật khẩu để tiếp quản.
- **`member_lookup`**: key theo email; gate xác minh + Firestore rule ngăn tài khoản chưa xác minh chiếm email.
- **Người dùng Google hiện tại**: không cần migrate dữ liệu; UID giữ nguyên; luồng đăng nhập một chạm không đổi.
- **Kiểm chứng**: chỉ static checks; QA tay do người dùng tự làm.
