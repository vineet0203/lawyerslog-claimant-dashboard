/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#CD0715',
        'navy': '#081A2F',
        'peach': '#FFF2EB',
        'grey-5': '#657573',
        'grey-4': '#979797',
        'grey-3': '#E8E8E8',
        'grey-2': '#EAEBEC',
        'grey-1': '#F4F5F7',
        'input-border': '#6C6A6A',
        'placeholder': '#AFADAD',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
