### 1. Quy tắc đặt tên

- **Folder:** PascalCase  
  _Giúp phân biệt thư mục với file, tăng tính nhất quán và dễ tìm kiếm._
- **File:** PascalCase  
  _Thể hiện rõ file là module/class, dễ nhận biết khi import._
- **Class:** PascalCase  
  _Theo chuẩn OOP, dễ phân biệt với biến/hàm._
- **Function, variable:** camelCase  
  _Đồng nhất với chuẩn JavaScript, dễ đọc, dễ viết._
- **Không dùng `_` cho private**  
  _Giữ code sạch, chỉ dùng khi thực sự cần thiết như singleton._

---

### 2. Quy tắc đặt tên nhánh (branch naming convention)

- **Tính năng mới:**  
  `feature/TenChucNang`  
  _Ví dụ:_ `feature/PlayerMovement`, `feature/EnemyAI`

- **Sửa lỗi:**  
  `fix/TenLoi`  
  _Ví dụ:_ `fix/LoadingBarNotUpdate`, `fix/EnemyHpDisplay`

- **Cải tiến:**  
  `improve/TenCaiTien`  
  _Ví dụ:_ `improve/LoadingSpeed`, `improve/AudioManager`

- **Refactor:**  
  `refactor/TenRefactor`  
  _Ví dụ:_ `refactor/PopupBase`, `refactor/EnemyController`

- **Hotfix:**  
  `hotfix/TenLoiNong`  
  _Ví dụ:_ `hotfix/CrashOnStart`

**Lưu ý:**

- Tiền tố luôn viết thường (`feature/`, `fix/`, ...), phần tên dùng PascalCase.
- Không dùng dấu cách, không ký tự đặc biệt.

## **Push code lên trước 5h30 để cùng nhau preview (vòng tròn).**

### 3. Quy tắc kế thừa & đặt tên class

- **CharacterBase:**  
  _Lớp logic nền tảng cho các loại nhân vật, giúp tái sử dụng và mở rộng hành vi chung._
- **CharacterItem:**  
  _Lớp nền tảng cho UI đại diện nhân vật, giúp quản lý hiển thị và thao tác trên giao diện._

---

### 4. Cấu trúc thư mục & mục đích

```
assets/
├── Animations/         # Quản lý các file hoạt ảnh, dễ tái sử dụng cho nhiều đối tượng
├── Fonts/              # Lưu trữ font chữ, giúp đồng bộ giao diện
├── Prefabs/            # Chứa các mẫu đối tượng, dễ tái sử dụng và quản lý
│   └── item            # (Có thể mở rộng thêm các nhóm prefab như Enemies, Players, Popups)
├── resources/          # Thư mục đặc biệt cho load động (dynamic loading) theo chuẩn Cocos
│   └── Sounds/         # Chứa các file âm thanh, đúng chuẩn Cocos (bắt buộc để load động, không kéo thả)
├── Scenes/             # Quản lý các cảnh trong game, mỗi scene là một màn chơi/giao diện
├── Scripts/            # Toàn bộ mã nguồn logic, chia module rõ ràng
│   ├── GameController.js # Quản lý logic tổng thể của game
│   ├── Enum/           # Quản lý các enum (ví dụ: EntityGroup.js, AudioKey.js, SoundConfigType.js)
│   ├── Event/          # Định nghĩa các event key, emitter, lắng nghe sự kiện
│   ├── Popups/         # Logic cho popup, tách biệt với prefab và UI
│   ├── Sound/          # Xử lý logic âm thanh, quản lý phát nhạc, hiệu ứng
│   ├── Utils/          # Các hàm tiện ích dùng chung, đặt tên SomethingUtils.js để dễ nhận biết
│   └── ...             # Các module khác (ví dụ: scene, ...)
├── Spines/             # Lưu trữ file spine cho hoạt ảnh xương, tối ưu hóa animation
├── Sprites/            # Ảnh sprite, chia theo scene hoặc component để dễ tìm kiếm
│   ├── Lobby/          # Sprite cho scene lobby
│   ├── Battle/         # Sprite cho scene battle
│   └── ...             # Sprite cho các component đặc biệt (ví dụ các popup)
```

**Lưu ý:**

- Thư mục gốc là `assets/` (không phải `Assets/`).
- Thư mục âm thanh phải nằm trong `assets/resources/Sounds/` để Cocos hỗ trợ load động (dynamic loading).
- File `GameController.js` nằm trực tiếp trong `assets/Scripts/` để quản lý logic tổng thể của game.
- Các thư mục con như Prefabs, Sprites, Spines, Fonts... đều nằm trong `assets/`.
- Có thể mở rộng thêm các nhóm prefab, sprite hoặc tạo thêm các thư mục module khác (ví dụ: Network, SaveData, ...) trong `Scripts/` theo nhu cầu thực tế dự án.

---

### 5. Công cụ hỗ trợ

- **draw.io:**  
  _Vẽ sơ đồ kiến trúc, flow, class diagram giúp team dễ hình dung tổng thể dự án và các mối quan hệ giữa các module._
- **Trello:**  
  _Quản lý task, phân chia công việc, theo dõi tiến độ, đảm bảo teamwork hiệu quả._