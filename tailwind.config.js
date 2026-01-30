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
        'via-orange-500',
        'to-amber-500',
        'shadow-red-600/30',
        'shadow-[0_8px_25px_-5px_rgba(234,88,12,0.5)]',
        'bg-gradient-to-br',
        'bg-gradient-to-t',
        'scrollbar-hide',
        'backdrop-blur-md'
    ],
    plugins: [],
}
