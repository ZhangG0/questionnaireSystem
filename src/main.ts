import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ArcoVue from '@arco-design/web-vue'
import Vant from 'vant'

// 引入样式
import '@arco-design/web-vue/dist/arco.css'
import 'vant/lib/index.css'

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(ArcoVue)  // PC端组件库
app.use(Vant)     // H5端组件库

app.mount('#app') 