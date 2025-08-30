import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,        // กำหนด port เป็น 3000
    strictPort: true,  // ถ้า port ไม่ว่าง จะ error แทนที่จะหา port อื่น
    open: true         // เปิด browser อัตโนมัติ
  }
})