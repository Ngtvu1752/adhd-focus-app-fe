import { useCallback, useRef } from 'react';

type SoundType = 
  | 'success_task'      // Tiếng ăn xu (Mario style)
  | 'success_big'       // Tiếng kèn chiến thắng (Fanfare)
  | 'start_timer'       // Tiếng lên dây cót/Bắt đầu (Rising)
  | 'timer_finish'      // Tiếng chuông (Bell)
  | 'gentle_reminder'   // Tiếng bong bóng (Bubble pop)
  | 'back_to_focus'     // Tiếng lấp lánh (Sparkle)
  | 'ui_click';         // Tiếng click nhẹ

export const useSoundEffects = () => {
  // Dùng Ref để giữ AudioContext, chỉ khởi tạo 1 lần
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Hàm khởi tạo AudioContext (Lazy load để tránh lỗi trình duyệt chặn)
  const getContext = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    return audioCtxRef.current;
  };

  const playSound = useCallback((type: SoundType) => {
    const ctx = getContext();
    const t = ctx.currentTime;

    switch (type) {
      // 1. SUCCESS TASK: Tiếng "Ting-Ting" (Kiểu ăn xu)
      case 'success_task': {
        // Nốt 1: Cao (B5) -> Nốt 2: Cao hơn (E6)
        [987.77, 1318.51].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'square'; // Sóng vuông nghe giống game 8-bit
          osc.frequency.setValueAtTime(freq, t + i * 0.1);
          
          gain.gain.setValueAtTime(0.05, t + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.1);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + i * 0.1);
          osc.stop(t + i * 0.1 + 0.1);
        });
        break;
      }

      // 2. SUCCESS BIG: Tiếng kèn Fanfare (Hợp âm Đô trưởng)
      case 'success_big': {
        // C4, E4, G4, C5 (Arpeggio nhanh)
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle'; // Sóng tam giác nghe giống kèn
          osc.frequency.value = freq;
          
          // Thời điểm bắt đầu lệch nhau một chút để tạo hiệu ứng rải
          const startTime = t + i * 0.08;
          
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0); // Ngân dài
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 2.0);
        });
        break;
      }

      // 3. START TIMER: Tiếng chuông "ting ting"
      case 'start_timer': {
        // Hai tiếng chuông gọn, mỗi tiếng gồm nốt gốc + harmonic nhẹ
        const strikes = [t, t + 0.12];
        strikes.forEach((startTime, i) => {
          const base = ctx.createOscillator();
          const harmonic = ctx.createOscillator();
          const gain = ctx.createGain();

          base.type = 'sine';
          harmonic.type = 'sine';
          base.frequency.value = 880; // A5
          harmonic.frequency.value = 1320; // Bậc 5 để tạo độ trong

          // Detune nhẹ cho tiếng chuông tự nhiên hơn
          base.detune.value = i === 0 ? -5 : 5;
          harmonic.detune.value = i === 0 ? 4 : -4;

          // Attack nhanh rồi tắt dần
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.15, startTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

          base.connect(gain);
          harmonic.connect(gain);
          gain.connect(ctx.destination);

          base.start(startTime);
          harmonic.start(startTime);
          base.stop(startTime + 0.5);
          harmonic.stop(startTime + 0.5);
        });
        break;
      }

      // 4. TIMER FINISH: Tiếng chuông (Bell) - Êm dịu
      case 'timer_finish': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, t); // C5
        
        // Thêm một harmonic nhẹ để tiếng chuông trong hơn
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(523.25 * 1.5, t); // Bậc 5
        
        // Chuông ngân dài
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

        gain2.gain.setValueAtTime(0.1, t);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 2.0);
        
        osc.connect(gain);
        osc2.connect(gain2);
        gain.connect(ctx.destination);
        gain2.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 2.5);
        osc2.start(t);
        osc2.stop(t + 2.5);
        break;
      }

      // 5. GENTLE REMINDER: Tiếng bong bóng (Bloop) - Nhắc nhở nhẹ
      case 'gentle_reminder': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        // Tần số trượt xuống nhanh tạo tiếng "Bloop"
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.1);
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }

      // 6. BACK TO FOCUS: Tiếng lấp lánh (Sparkle/Magic)
      case 'back_to_focus': {
        // Một chuỗi nốt cao ngẫu nhiên hoặc đi lên
        const notes = [1046.50, 1318.51, 1567.98, 2093.00]; // C6, E6, G6, C7
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          const startTime = t + i * 0.05; // Rất nhanh
          
          gain.gain.setValueAtTime(0.05, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.3);
        });
        break;
      }

      // 7. UI CLICK: Tiếng click ngắn
      case 'ui_click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine'; // Hoặc 'triangle' cho tiếng đanh hơn
        osc.frequency.setValueAtTime(800, t);
        
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05); // Cực ngắn
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
        break;
      }
    }
  }, []);

  return { playSound };
};