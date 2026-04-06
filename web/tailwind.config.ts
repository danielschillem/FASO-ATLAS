import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        rouge:    '#C1272D',
        vert:     '#006B3C',
        or:       '#D4A017',
        'or-vif': '#F0B429',
        terre:    '#7C3B1E',
        sable:    '#F5E6C8',
        'sable-2':'#EDD9A3',
        nuit:     '#160A00',
        brun:     '#2A1200',
        gris:     '#8A7060',
        blanc:    '#FDFAF5',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:  ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        faso: '0 4px 32px rgba(22,10,0,.14)',
        card: '0 2px 16px rgba(22,10,0,.10)',
      },
      borderRadius: {
        DEFAULT: '6px',
        card: '12px',
        pill: '100px',
      },
      transitionTimingFunction: {
        faso: 'cubic-bezier(.4,0,.2,1)',
      },
      backgroundImage: {
        'pattern-geo': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4A017' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      height: {
        nav: '72px',
      },
    },
  },
  plugins: [],
}

export default config
