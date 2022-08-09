
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import VueClipboard from 'vue-clipboard2'
import i18n from '@/assets/locales/index'
import message from '@/components/message/index.js'

// import vConsole from '@/assets/js/vconsole.js'
import "element-ui/lib/theme-chalk/index.css";


Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.use(message)
Vue.use(VueClipboard);

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
}).$mount("#app");
