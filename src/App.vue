<template>
  <!-- 
    설정 로딩 중: 로딩 화면 표시
    isLoading이 true인 동안은 router-view 자체를 렌더링하지 않습니다.
    configStore.fetchConfig()가 완료되기 전까지 하위 컴포넌트(LoginPage 등)의
    onMounted가 실행되지 않도록 막는 역할을 합니다.
  -->
  <LoadingOverlay
    :isLoading="isLoading"
    :loadingText="`화면을 구성하고 있습니다`"
    :primaryColor="configStore.mainColorHexCode"
    :hoverColor="configStore.mainHoverColorHexCode"
  />

  <!-- 
    설정 로드 완료: 실제 앱 렌더링
    v-if="!isLoading" 으로 config가 완전히 준비된 후에만 렌더링합니다.
    이렇게 해야 하위 컴포넌트(LoginPage 등)의 onMounted 시점에
    configStore.office 등의 값이 보장됩니다.

    동적으로 layout을 변경합니다.
    route.meta.layout에 따라:
    - "AuthLayout" -> AuthLayout 컴포넌트 렌더링
    - "MainLayout" -> MainLayout 컴포넌트 렌더링
    - 없음 -> router-view만 렌더링
  -->
  <template v-if="!isLoading">
    <component :is="currentLayout" v-if="currentLayout">
      <router-view />
    </component>
    <router-view v-else />
  </template>
</template>

<script setup>
/**
 * App.vue - 루트 컴포넌트
 *
 * [핵심 초기화 순서]
 * 1. onBeforeMount: isLoading = true → router-view 렌더링 차단
 * 2. onMounted: configStore.fetchConfig() → 서버 설정 로드
 * 3. favicon 업데이트
 * 4. authStore.restoreSession() → 세션 복구
 * 5. isLoading = false → router-view 렌더링 허용 (하위 컴포넌트 onMounted 실행)
 *
 * isLoading이 false가 된 후에야 LoginPage 등이 마운트되므로
 * configStore.office 등 서버 설정값이 항상 보장됩니다.
 */
import { onBeforeMount, computed, onMounted, ref, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";

// ==================== layout 컴포넌트 import ====================
import AuthLayout from "@/layout/AuthLayout.vue";
import MainLayout from "@/layout/MainLayout.vue";
import LoadingOverlay from "@/components/common/LoadingOverlay.vue";

// ==================== router 및 store ====================
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const configStore = useConfigStore();

/**
 * isLoading: 앱 초기화 완료 여부
 *
 * true  → LoadingOverlay 표시 + router-view 렌더링 차단
 * false → LoadingOverlay 숨김 + router-view 렌더링 허용
 *
 * [Vue2 vs Vue3]
 * Vue2: data() { return { isLoading: false } }
 * Vue3: ref(false) 로 반응형 상태를 선언합니다.
 */
const isLoading = ref(false);

// ==================== layout 매핑 객체 ====================
/**
 * layoutComponents: 레이아웃 컴포넌트 매핑 테이블
 *
 * meta.layout의 문자열 값을 실제 컴포넌트로 변환합니다.
 * 예: "AuthLayout" -> AuthLayout 컴포넌트
 *
 * 새로운 layout을 추가할 때:
 * 1. import로 컴포넌트 불러오기
 * 2. 이 객체에 key-value 추가
 * 3. router/index.js의 meta.layout에 key 이름 지정
 */
const layoutComponents = {
  AuthLayout,
  MainLayout,
};

// ==================== 계산된 속성: 현재 layout ====================
/**
 * currentLayout: 현재 route에 필요한 layout 컴포넌트를 반환하는 computed
 *
 * [Vue2 vs Vue3]
 * Vue2: computed: { currentLayout() { ... } }
 * Vue3: computed(() => { ... }) 함수형으로 선언합니다.
 *
 * route.meta.layout 값을 읽어 layoutComponents에서 해당 컴포넌트를 찾습니다.
 * route가 변경되면 자동으로 재계산됩니다.
 */
const currentLayout = computed(() => {
  const layoutName = route.meta.layout;
  console.log("현재 route:", route.path);
  console.log("현재 layout:", layoutName);
  console.log("로그인 상태:", authStore.isLoggedIn);
  return layoutComponents[layoutName];
});

// ==================== 유틸 함수 ====================

/**
 * updateFavicon: 파비콘을 동적으로 변경합니다.
 * 서버에서 받아온 faviconUrl로 <link rel="icon"> 태그를 업데이트합니다.
 *
 * @param {string} faviconUrl - 서버에서 받아온 파비콘 이미지 URL
 */
async function updateFavicon(faviconUrl) {
  if (!faviconUrl) return;

  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = faviconUrl;
}

// ==================== 라이프사이클 ====================

/**
 * onBeforeMount: 컴포넌트가 DOM에 마운트되기 직전에 실행
 *
 * isLoading = true로 먼저 설정하여
 * 마운트 즉시 LoadingOverlay가 표시되고 router-view가 차단되도록 합니다.
 *
 * [Vue2 vs Vue3]
 * Vue2: beforeMount() { this.isLoading = true }
 * Vue3: onBeforeMount(() => { isLoading.value = true })
 */
onBeforeMount(() => {
  isLoading.value = true;
});

/**
 * onMounted: 컴포넌트가 DOM에 마운트된 직후 실행
 *
 * 초기화 순서가 중요합니다:
 * 1. fetchConfig → 서버 설정 로드 (office, color, logo 등)
 * 2. updateFavicon → 파비콘 적용
 * 3. restoreSession → 토큰 기반 로그인 상태 복구
 * 4. isLoading = false → 이 시점부터 router-view 렌더링 허용
 *    → LoginPage 등 하위 컴포넌트의 onMounted가 이 이후에 실행됨
 *    → configStore.office가 반드시 준비된 상태가 보장됨
 *
 * [Vue2 vs Vue3]
 * Vue2: async mounted() { ... }
 * Vue3: onMounted(async () => { ... })
 */
onMounted(async () => {
  console.log("============================================");
  console.log("App.vue 초기화 시작");
  console.log("============================================");

  // Step 1: 서버 설정 로드
  console.log("App.vue:서버 설정 로드 시작...");
  try {
    await configStore.fetchConfig();
  } catch (configError) {
    // fetchConfig 전용 에러 처리
    router.push("/not-configured");
    console.error("App.vue:설정 로드 실패:", configError);
    // 기본값으로 fallback 처리 등
  }
  console.log("서버 설정 로드 완료!");

  // Step 2: 파비콘 업데이트
  console.log("============================================");
  console.log("파비콘 설정 로드 시작...");
  await updateFavicon(configStore.faviconImageUrl);
  console.log("파비콘 로딩 완료!");

  // Step 3: 세션 복구 (로컬스토리지 토큰으로 로그인 상태 복원)
  console.log("============================================");
  console.log("세션 복구 시작...");
  await authStore.restoreSession();
  await nextTick();

  // Step 4: 초기화 완료 로그
  console.log("============================================");
  console.log("앱 초기화 완료!");
  console.log("설정 데이터:", configStore.serverConfig);
  console.log("회사명:", configStore.office);
  console.log("로고:", configStore.logoImageUrl);
  console.log("판넬:", configStore.loginPannelImageUrl);
  console.log("메인 색상:", configStore.mainColorHexCode);
  console.log("로그인 상태:", authStore.isLoggedIn);
  console.log("사용자:", authStore.user);
  console.log("현재 layout:", currentLayout.value?.name || "none");
  console.log("============================================");

  isLoading.value = false;

  console.log("앱 마운트 완료 - 화면 렌더링 시작");
  console.log("세션 상태:", authStore.isLoggedIn);
  console.log("현재 layout:", currentLayout.value?.name || "none");
});
</script>
