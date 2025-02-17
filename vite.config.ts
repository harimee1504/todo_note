import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    federation({
      name: 'todo',
      filename: 'assets/remoteEntry.js',
      remotes: {
        auth: 'auth@https://auth-layout.vercel.app/auth/_next/static/chunks/remoteEntry.js',
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
  base: '/',
  server: {
		port: 3000,
		proxy: {
			'/auth': {
				target: 'https://auth-layout.vercel.app/auth',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/auth/, ''),
			},
		}
	},
})
