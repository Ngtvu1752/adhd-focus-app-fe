/** @type {import('tailwindcss').Config} */
export default {
  // 1. Kích hoạt Dark Mode (bắt buộc cho globals.css)
  darkMode: "class",
  
  // 2. Sửa lại đường dẫn quét file
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Quét tất cả các file trong src
  ],
  
  theme: {
    extend: {
      // 3. HỢP NHẤT MÀU SẮC
      colors: {
        // --- A. Các màu từ globals.css (CHO ỨNG DỤNG FOCUS) ---
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        'input-background': 'var(--input-background)',
        'switch-background': 'var(--switch-background)',
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          'primary-foreground': "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          'accent-foreground': "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },

        // --- B. Các màu từ index.css (CHO TRANG ĐĂNG NHẬP) ---
        'bg-primary': 'var(--color-bg-primary)',
        'text-primary': 'var(--color-text-primary)',
        'neutral-light': 'var(--color-neutral-light)',
        
        // QUAN TRỌNG: Đã đổi tên để tránh xung đột
        'login-secondary': 'var(--color-secondary)',
        'login-accent': 'var(--color-accent)',
      },
      
      // 4. Radius (từ globals.css)
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },

      // 5. HỢP NHẤT Keyframes
      keyframes: {
        // Từ globals.css (cho Accordion, v.v.)
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Từ config cũ của bạn (cho trang đăng nhập)
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },

      // 6. HỢP NHẤT Animations
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'float': 'float 8s ease-in-out infinite',
      },

      // 7. Transition (từ config cũ của bạn)
      transitionTimingFunction: {
        'custom-bezier': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      }
    },
  },
  plugins: [],
}