import { createApp } from 'vue';
import '@styles/style.scss';
import router from '@js/Router/index.js';
import App from '@js/Layouts/AppLayout.vue';

const app = createApp(App);
app.use(router).mount('#app');
