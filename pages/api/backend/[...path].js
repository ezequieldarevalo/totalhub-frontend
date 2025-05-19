import { createProxyMiddleware } from 'http-proxy-middleware';

export const config = {
  api: {
    bodyParser: false, // 🔥 importante para permitir el stream de body
  },
};

const proxy = createProxyMiddleware({
  target: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/backend': '', // 🔁 quita /api/backend del path para que llegue limpio al backend
  },
});

export default function handler(req, res) {
  return proxy(req, res, () => { });
}
