import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 넥서스 브랜드 컬러
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe', 
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#64748b',
          600: '#475569',
        },
        // 시니어 친화적 고대비 컬러
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontSize: {
        // 시니어 친화적 큰 폰트 사이즈
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.5' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.6' }],
        '2xl': ['1.5rem', { lineHeight: '1.6' }],
        '3xl': ['1.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        // 터치 친화적 간격
        '18': '4.5rem',
        '88': '22rem',
      }
    },
  },
  plugins: [],
} satisfies Config;