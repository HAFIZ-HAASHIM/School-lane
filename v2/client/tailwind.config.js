/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0D1117',
                surface: 'rgba(22, 27, 34, 0.7)', // Semi-transparent glass base
                surfaceSolid: '#161B22',
                primary: {
                    400: '#818cf8',
                    500: '#6366F1', // Electric indigo
                    600: '#4f46e5',
                },
                secondary: '#F59E0B', // Warm amber
                textPrimary: '#F0F6FF', // Off-white
                textSecondary: '#8B99B5', // Slate
                success: '#10B981',
                warning: '#F59E0B',
                danger: '#F43F5E', // Rose
            },
            fontFamily: {
                display: ['Fraunces', 'serif'],
                sans: ['"DM Sans"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out forwards',
                'pulse-border': 'pulseBorder 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseBorder: {
                    '0%, 100%': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                    '50%': { borderColor: 'rgba(99, 102, 241, 1)' },
                }
            }
        },
    },
    plugins: [],
}
