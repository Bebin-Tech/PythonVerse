import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>({define:{__PROTOTYPE_ONLY__:JSON.stringify(mode==='prototype')},plugins:[react()],server:{proxy:{'/api':loadEnv(mode,'.','').PYTHONVERSE_API_URL||'http://127.0.0.1:8000'}}}));
