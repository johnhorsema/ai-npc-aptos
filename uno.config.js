import { defineConfig } from 'unocss'
import { presetWind, presetIcons } from 'unocss'

export default defineConfig({
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    colors: {
      'harp': {
        '50': '#f1f8f3',
        '100': '#dcefe1',
        '200': '#bbdfc6',
        '300': '#8ec7a3',
        '400': '#5fa87d',
        '500': '#3d8c60',
        '600': '#2c6f4b',
        '700': '#23593e',
        '800': '#1e4733',
        '900': '#193b2a',
        '950': '#0d2118',
      },
      'dusty': {
        '50': '#f4f3f2',
        '100': '#e3dfde',
        '200': '#c8c2c0',
        '300': '#a89e9c',
        '400': '#897a78',
        '500': '#817271',
        '600': '#6e6061',
        '700': '#594f50',
        '800': '#4e4546',
        '900': '#453e40',
        '950': '#262223',
      },
      'splash': {
        '100': '#c4e4d1'
      }
    }
  },
  presets: [
    presetWind(),
    presetIcons()
  ],
})
