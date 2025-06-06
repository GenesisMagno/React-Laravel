// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '2100px',
        '3xl': '1620px',
        // Your custom breakpoints
        'mobile': '320px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'ultrawide': '2560px',
        // You can also use max-width breakpoints
        'max-md': {'max': '767px'},
        'max-lg': {'max': '1023px'},
      }
    },
  },
  plugins: [],
}