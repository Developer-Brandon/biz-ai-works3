/**
- Vue Router는 createRouter와 createWebHistory를 사용해 라우트를 구성한다.
- 동적 import로 코드 스플리팅을 적용하고, beforeEach 가드로 로그인 기반 접근을 제어한다.
- 라우트는 path / name / component / meta 구조로 정의하며, name 지정이 중요하다.
 **/
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useDataStore } from "@/stores/model/dataStore";

// ==================== 라우트 정의 ====================
const routes = [
  // 1.auth route
  {
    path: "/login",
    name: "Login",
    component: () => import("@/pages/LoginPage.vue"),
    meta: {
      requiresAuth: false, // 로그인 필수 X
      layout: "AuthLayout", // 인증 레이아웃 사용
      title: "Biz.AI", // 페이지 제목
    },
  },
  // 2. main route - 채팅 페이지
  {
    path: "/",
    redirect: "/main", // / 접근 시 /main으로 리다이렉트
  },
  {
    path: "/main",
    name: "Main",
    component: () => import("@/pages/MainPage.vue"),
    meta: {
      requiresAuth: true, // 로그인 필수 O
      layout: "MainLayout", // 메인 레이아웃 사용
      title: "Biz.AI",
    },
  },
  // 3. notfound page - 404 페이지
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/pages/NotFound.vue"),
    meta: {
      requiresAuth: false,
      layout: "AuthLayout", // 인증 레이아웃 사용
      title: "페이지를 찾을 수 없습니다",
    },
  },
  // 4.not configured
  {
    path: "/not-configured",
    name: "NotConfigured",
    component: () => import("@/pages/NotConfigured.vue"),
    meta: { layout: null }, // 레이아웃 없이 단독 렌더링
  },
];

// ==================== 라우트 정의 후 인스턴스 생성 ====================
export const router = createRouter({
  // histroy mode : 깔끔한 URL 사용
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// ==================== 라우트 가드 - 이동 전 ====================
/**
 * router.beforeEach: 모든 라우트 전환 전에 실행
 *
 * 역할:
 * 1. 인증 확인 (로그인 필수 페이지 보호)
 * 2. 권한 확인
 * 3. 페이지 제목 설정
 * 4. 분석(Analytics) 기록
 */
router.beforeEach((to, from, next) => {
  console.group("[Router Guard] beforeEach");
  document.title = to.meta.title;
  const authStore = useAuthStore(); // Pinia 스토어
  const dataStore = useDataStore();
  const isAuthenticated = authStore.isLoggedIn;
  console.log("✅ 로그인 상태체크:", isAuthenticated);

  console.log("세션 필드 초기화 시작");
  dataStore.initializeSessionFields();

  // 1. 어디에서 접근하는지는모르지만, 로그인을 하지 않았는데 인증한 페이지로 접근한다면?
  // -> /login 페이지로 강제 이동
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.warn(" 인증 필요: /login으로 redirect");
    next("/login");
    return;
  }
  // 2. 어디서 접근하는지는 모르지만, 이미 로그인을 했는데 /login 페이지로 접근했다면?
  // -> /main 페이지로 강제이동
  if (isAuthenticated && to.path === "/login") {
    console.log("✅ 이미 로그인됨: /main으로 redirect");
    next("/main");
    return;
  }
  // 3.모든 조건 통과
  // -> 현재의 route에서 그냥 머무르기
  next();
});
// ==================== 라우트 가드 - 이동 후 ====================
/**
 * router.afterEach: 라우트 전환 완료 후 실행
 * 역할:
 * - 로딩 스피너 종료
 * - Analytics 이벤트 기록
 * - 스크롤 복원
 */
router.afterEach((to, from) => {
  console.log(` 페이지 이동: ${from.path} → ${to.path}`);

  // 개발 환경에서만 라우트 정보 출력
  if (import.meta.env.DEV || import.meta.env.PROD) {
    console.log("이전 라우트:", from.name);
    console.log("현재 라우트:", to.name);
    console.log("이전 경로:", from.path);
    console.log("현재 경로:", to.path);
    console.log("라우트 파라미터:", to.params);
    console.log("라우트 쿼리:", to.query);
  }
});
export default router;
