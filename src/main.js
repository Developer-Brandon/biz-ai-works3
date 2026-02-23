import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import { router } from "@/router";

/**
 * 전역 스타일 import
 */
import "@/assets/styles/whole_variables.scss";
import "@/assets/styles/global/whole_globals.scss";

/* ==================== Vue 애플리케이션 초기화 ==================== */
const app = createApp(App);
const pinia = createPinia();
/* ==================== Pinia 스토어 설정 ==================== */
pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
/* ==================== 전역 프로퍼티 설정 ==================== */
app.config.globalProperties.$appName = "Biz.AI";

/* ==================== 애플리케이션 마운트 ==================== */
/**
 * #app 엘리먼트에 Vue 애플리케이션을 마운트합니다. public/index.html의 <div id="app"></div>에 마운트
 */
app.mount("#app");

/**
 * 마운트 후 확인 (개발, 운영 환경)
 */
if (import.meta.env.DEV) {
  console.log("✅ [개발] 애플리케이션 초기화 완료");
}

if (import.meta.env.PROD) {
  console.log("✅ [운영] 애플리케이션 초기화 완료");
}
