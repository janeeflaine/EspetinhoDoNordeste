/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {},
    },
    safelist: [
        'from-red-600',
        'to-amber-500',
        'shadow-red-600/30',
        'bg-gradient-to-br',
        'scrollbar-hide'
    ],
    plugins: [],
}
