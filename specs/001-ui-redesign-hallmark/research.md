# Research: UI Redesign - Atmospheric Lumen

- **Decision**: Sử dụng OKLCH với tone `Night Foundry (amber-gold)`.
- **Rationale**: Phong cách Atmospheric (Hallmark) yêu cầu dark canvas và hạn chế sử dụng màu tuyệt đối `#000`/`#fff`. OKLCH cung cấp độ nhất quán màu sắc cao hơn sRGB.
- **Alternatives considered**: HSL/RGB (bị loại vì độ tương phản không đồng đều).

- **Decision**: Thay Navbar từ dạng sticky ngang thành `N5 Floating pill`.
- **Rationale**: Phá vỡ form mặc định "AI Nav", mang lại cảm giác ứng dụng độc lập, premium.
- **Alternatives considered**: `N9 Edge-aligned` (bị loại vì Floating pill phù hợp hơn với Atmospheric canvas).
