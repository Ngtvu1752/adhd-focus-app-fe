export const VOICE_SCRIPTS = {
  GREETING: [
    "Xin chào {name}, chúc con một ngày học tập vui vẻ!",
    "Chào {name}, đã sẵn sàng để trở thành siêu nhân học tập chưa?"
  ],
  DISTRACTION: [
    "{name} ơi, tập trung nào!",
    "Mình quay lại bài học nhé {name} ơi!",
    "A lô a lô, {name} có nghe thấy tớ không? Nhìn màn hình nào!"
  ],
  TASK_COMPLETE: [
    "Xuất sắc! {name} giỏi quá!",
    "Tuyệt vời ông mặt trời! {name} đã xong nhiệm vụ rồi."
  ],
  TIMER_FINISH: [
    "Hết giờ rồi! {name} nghỉ ngơi chút đi nhé.",
    "Bính boong! Giờ nghỉ giải lao của {name} đến rồi."
  ]
};

// Hàm helper để lấy ngẫu nhiên
export const getRandomScript = (category: keyof typeof VOICE_SCRIPTS) => {
  const list = VOICE_SCRIPTS[category];
  return list[Math.floor(Math.random() * list.length)];
};