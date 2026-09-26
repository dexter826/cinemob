/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['"Be Vietnam Pro"', 'sans-serif'],
            },
            colors: {
                background: 'rgb(var(--color-background) / <alpha-value>)',
                surface: 'rgb(var(--color-surface) / <alpha-value>)',
                'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
                'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
                'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
                'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
                border: 'rgb(var(--color-border) / <alpha-value>)',
                focus: 'rgb(var(--color-focus) / <alpha-value>)',
                success: 'rgb(var(--color-success) / <alpha-value>)',
                warning: 'rgb(var(--color-warning) / <alpha-value>)',
                danger: 'rgb(var(--color-danger) / <alpha-value>)',
                info: 'rgb(var(--color-info) / <alpha-value>)',
                /* Legacy aliases, remove only after rg proves zero consumers. */
                'text-main': 'rgb(var(--color-text-main) / <alpha-value>)',
                'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
                error: 'rgb(var(--color-error) / <alpha-value>)',
                'border-default': 'var(--border-default)',
            },
            borderRadius: {
                control: 'var(--radius-control)',
                card: 'var(--radius-card)',
                dialog: 'var(--radius-dialog)',
            },
            boxShadow: {
                'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
                'premium-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
                'card': 'var(--shadow-card)',
                'elevated': 'var(--shadow-elevated)',
            },
            animation: {
                'slide-in-right': 'slide-in-right 0.3s ease-out forwards',
                'slide-down': 'slide-down 0.3s ease-out forwards',
                'fade-in': 'fade-in 0.2s ease-out forwards',
                'zoom-in-95': 'zoom-in-95 0.2s ease-out forwards',
            },
            keyframes: {
                'slide-in-right': {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'slide-down': {
                    '0%': { transform: 'translateY(-100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'zoom-in-95': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}