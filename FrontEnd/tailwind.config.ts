import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // Performance optimizations
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Remove unused CSS in production (automatic with content array)
  safelist: [],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Custom brand color palette - Exact hex codes from image
        brand: {
          50: '#F0F9F4',    // Lightest green tint
          100: '#DCF4E6',   // Very light green
          200: '#B9E9CD',   // Light green
          300: '#96DEB4',   // Medium-light green
          400: '#73D39B',   // Medium green
          500: '#5FBD92',   // Light Green (from image)
          600: '#227D53',   // Medium Green (from image)
          700: '#1A5F3F',   // Darker medium green
          800: '#13452D',   // Dark Green (from image)
          900: '#0C2B1E',   // Very dark green
          950: '#05110C',   // Darkest green
        },
        // Additional palette colors - Exact hex codes
        green: {
          light: '#5FBD92',  // Light Green (from image)
          medium: '#227D53', // Medium Green (from image)
          dark: '#13452D',   // Dark Green (from image)
          muted: '#889A94',  // Grayish Green (from image)
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        "glow-lg": "var(--shadow-glow-lg)",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card": "var(--gradient-card)",
        // Premium green gradients
        "gradient-green": "linear-gradient(135deg, #13452D 0%, #227D53 50%, #5FBD92 100%)",
        "gradient-green-light": "linear-gradient(135deg, #5FBD92 0%, #73D39B 50%, #B9E9CD 100%)",
        "gradient-green-dark": "linear-gradient(135deg, #0C2B1E 0%, #13452D 50%, #1A5F3F 100%)",
        "gradient-mesh": "radial-gradient(circle at 20% 80%, #5FBD92 0%, transparent 50%), radial-gradient(circle at 80% 20%, #227D53 0%, transparent 50%), radial-gradient(circle at 40% 40%, #889A94 0%, transparent 50%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out",
        "slide-in-left": "slide-in-left 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        blob: "blob 7s infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "pulse-soft": "pulse-soft 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 10s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        "pulse-soft": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)",
          },
        },
        "gradient-shift": {
          "0%, 100%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
