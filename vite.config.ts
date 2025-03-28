import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// Custom plugin to inject remote stylesheet
const injectRemoteStylesheet = () => ({
  name: 'inject-remote-stylesheet',
  transformIndexHtml(html: string) {
    return html.replace(
      '</head>',
      `<link rel="stylesheet" href="https://auth-layout.vercel.app/_next/static/chunks/pages/_app.css" media="all" importance="high" />\n</head>`
    )
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    injectRemoteStylesheet(),
    federation({
      name: 'todo',
      filename: 'assets/remoteEntry.js',
      remotes: {
        auth: 'auth@https://auth-layout.vercel.app/_next/static/chunks/remoteEntry.js',
      },
      exposes: {
        "./SideBarData": "./src/exposed/SidebarParams.ts",
        "./TaskNote": "./src/exposed/ExposedApp.tsx",
      },
      shared: ['react', 'react-dom', 'react-router-dom','@clerk/clerk-react'],
    })
  ],
  build: {
    modulePreload: false,
    minify: false,
    target: 'esnext',
    cssCodeSplit: false
  },
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/_next': {
        target: 'https://auth-layout.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
