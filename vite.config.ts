import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

// Em produção o site roda no mesmo domínio da API (kihabbo.com.br/v1).
// No desenvolvimento (e no preview), o Vite repassa /v1 para a API real, que só aceita CORS do próprio domínio.
const apiProxy: Record<string, ProxyOptions> = {
  '/v1': { target: 'https://www.kihabbo.com.br', changeOrigin: true, secure: true },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
