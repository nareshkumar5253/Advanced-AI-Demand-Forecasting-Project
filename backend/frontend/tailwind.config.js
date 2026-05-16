export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15202B",
        cloud: "#F4F7FA",
        teal: "#0F766E",
        amber: "#D97706"
      },
      boxShadow: {
        panel: "0 16px 40px rgba(21, 32, 43, 0.08)"
      }
    }
  },
  plugins: []
}