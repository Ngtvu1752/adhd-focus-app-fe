/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./ADHD_FE/**/*.{js,ts,jsx,tsx}", // Đảm bảo quét các tệp của bạn
  ],
  theme: {
    extend: {
      // Ánh xạ các biến CSS từ index.css vào các lớp Tailwind
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'secondary': 'var(--color-secondary)',
        'neutral-light': 'var(--color-neutral-light)',
        'accent': 'var(--color-accent)',
        'text-primary': 'var(--color-text-primary)',
      },
      // Giữ lại các tùy chỉnh animation/transition từ các tệp gốc
      animation: {
        'float': 'float 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      transitionTimingFunction: {
        'custom-bezier': 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
      }
    },
  },
  plugins: [],
}