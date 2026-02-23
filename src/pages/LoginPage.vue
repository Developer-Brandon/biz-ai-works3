<!-- ========== 로그인 페이지 메인 컴포넌트 ========== -->
<template>
  <div class="login-page">
    <div class="login-page__inner">
      <div class="login-form-section">
        <div class="login-container">
          <div class="login-header">
            <h1 class="login-title">로 그 인</h1>
            <p class="login-subtitle">
              {{ configStore.office }} AI 에 오신것을 환영합니다
            </p>
          </div>
          <form class="login-form" @submit.prevent="handleLogin">
            <!-- ========== 이메일 입력 필드 ========== -->
            <div class="form-group email-group" @keydown.enter="handleLogin">
              <InputField
                v-model="email"
                type="email"
                placeholder="ID(email)"
                :error="formErrors.email"
                :disabled="isLoading"
              >
                <CommonIcon :src="emailIconPath" />
              </InputField>
            </div>
            <!-- ========== 비밀번호 입력 필드 ========== -->
            <div class="form-group password-group" @keydown.enter="handleLogin">
              <InputField
                v-model="password"
                type="password"
                placeholder="Password"
                :error="formErrors.password"
                :disabled="isLoading"
              >
                <CommonIcon :src="passwordIconPath" />
              </InputField>
            </div>
            <!-- ========== 에러 메시지 (전체 폼) ========== -->
            <div v-if="error" class="form-error">
              <span class="error-text">{{ error }}</span>
            </div>
            <!-- ========== 체크박스: 아이디 저장 ========== -->
            <Checkbox
              v-model="rememberEmail"
              label="아이디 저장"
              class="remember-email-checkbox"
            />
          </form>
          <!-- ========== 로그인 버튼 ========== -->
          <Button
            class="login-button"
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            :loading="isLoading"
            @click="handleLogin"
          >
            로그인
          </Button>
          <div class="login-footer">
            <button
              type="button"
              class="link-button"
              @click="handleForgotPassword"
            >
              비밀번호 찾기
            </button>
            <span class="divider">|</span>
            <button type="button" class="link-button" @click="handleSignup">
              계정 생성
            </button>
          </div>
        </div>
      </div>
      <!-- 배경 그라디언트 + 애니메이션 요소들 -->
      <div class="login-graphic-section">
        <div class="graphic-background"></div>
      </div>
    </div>
  </div>
  <PrimaryPopup
    v-if="showPopup"
    :title="popupConfig.title"
    :message="popupConfig.message"
    :confirmText="popupConfig.confirmText"
    @confirm="closePopup"
    @close="closePopup"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useTestAuthStore } from "@/stores/useTestAuthStore";
import { useRouter } from "vue-router";
import InputField from "@/components/common/InputField.vue";
import Button from "@/components/common/Button.vue";
import Checkbox from "@/components/common/Checkbox.vue";
import CommonIcon from "@/components/icon/CommonIcon.vue";
import PrimaryPopup from "@/components/modals/PrimaryPopup.vue";
import { authApi } from "@/api/modules/authApi";
import { VALIDATION_RULES } from "@/utils/constants";

const emailIconPath = new URL("@/assets/images/icon/email.png", import.meta.url)
  .href;
const passwordIconPath = new URL(
  "@/assets/images/icon/key.png",
  import.meta.url,
).href;
const router = useRouter();

/* ==================== Store ==================== */
const authStore = useAuthStore();
const configStore = useConfigStore();
const testAuthStore = useTestAuthStore();

/* ==================== Refs ==================== */
const email = ref(testAuthStore.testRandomEmail);
const password = ref(testAuthStore.testPassword);

// UI 상태
const isLoading = ref(false);
const rememberEmail = ref(false);

// 에러 상태
const error = ref(null);
const formErrors = ref({
  email: null,
  password: null,
});

// 팝업
const showPopup = ref(false);
const popupConfig = ref({
  title: "",
  message: "",
  confirmText: "확인",
});

/* ==================== Methods ==================== */
function showPopupMessage(title, message, confirmText = "확인") {
  popupConfig.value = { title, message, confirmText };
  showPopup.value = true;
}

function closePopup() {
  showPopup.value = false;
}

/* 폼 검증 */
function validateForm() {
  formErrors.value = { email: null, password: null };
  error.value = null;

  if (!email.value.trim()) {
    formErrors.value.email = "이메일을 입력해주세요.";
    return false;
  }

  const emailRegex = VALIDATION_RULES.EMAIL.PATTERN;
  if (!emailRegex.test(email.value)) {
    formErrors.value.email = "올바른 이메일 형식이 아닙니다.";
    return false;
  }

  if (!password.value.trim()) {
    formErrors.value.password = "비밀번호를 입력해주세요.";
    return false;
  }

  if (
    password.value.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH ||
    password.value.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH
  ) {
    formErrors.value.password = "비밀번호는 6자 이상 15자 이하여야 합니다.";
    return false;
  }

  return true;
}

/**
 * 로그인
 */
async function handleLogin() {
  if (isLoading.value) return;
  if (!validateForm()) return;

  isLoading.value = true;
  error.value = null;

  try {
    console.group("로그인 시작");

    const payloadResponse = await authApi.generateLoginPayload({
      email: email.value.trim(),
      password: password.value.trim(),
    });

    if (!payloadResponse.success) {
      throw new Error(payloadResponse.message);
    }

    const { encryptedData, encryptedAesKey, iv } = payloadResponse.data;

    const loginResponse = await authApi.login(
      encryptedData,
      encryptedAesKey,
      iv,
    );

    if (!loginResponse.success) {
      throw new Error(loginResponse.message);
    }

    const { accessToken, refreshToken, isInitialPassword } = loginResponse.data;

    authStore.setAuthData({
      email: email.value.trim(),
      accessToken,
      refreshToken,
      isInitialPassword,
    });

    if (rememberEmail.value) {
      authStore.saveEmail(email.value.trim());
    } else {
      authStore.clearSavedEmail();
    }

    console.groupEnd();

    router.push(isInitialPassword ? "/change-initial-password" : "/main");
  } catch (err) {
    console.error(err);
    error.value = err.message || "로그인 중 오류가 발생했습니다";

    showPopupMessage("로그인 실패", error.value);
  } finally {
    isLoading.value = false;
  }
}

function handleForgotPassword() {
  showPopupMessage(
    "비밀번호 초기화 안내",
    "비밀번호 초기화는 관리자에게 문의해주세요.",
  );
}

function handleSignup() {
  showPopupMessage(
    "계정 생성 안내",
    "신규 계정 생성은 관리자에게 문의해주세요.",
  );
}

async function initializeZoom() {
  const contentArea = document.querySelector(".login-form-section");
  if (contentArea) {
    contentArea.style.transform = "scale(0.8)";
    contentArea.style.transformOrigin = "top center";
  }
}

/* ==================== Lifecycle ==================== */
onMounted(async () => {
  await initializeZoom();
  await authStore.loadSavedEmail();
  if (authStore.savedEmail) {
    email.value = authStore.savedEmail;
    rememberEmail.value = true;
  } else {
    await testAuthStore.setRandomTestEmail(configStore.office);
    email.value = testAuthStore.testRandomEmail;
    console.log("LoginPage.vue:email.value:", email.value);
  }
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== 전체 페이지 & 전체 페이지 내부 ==================== */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: $gray-200;

  @media (max-width: $breakpoint-phone) {
    height: auto;
    min-height: 100vh;
    padding: $spacing-4;
  }

  &__inner {
    display: flex;
    width: 970px;
    height: 600px;
    background-color: $white;
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba($black, 0.1);

    @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
      width: 850px;
      height: 500px;
    }

    @media (max-width: $breakpoint-phone) {
      width: 100%;
      height: auto;
      flex-direction: column;
      padding: $spacing-2 !important;
      border-radius: 16px;
      box-shadow: none;
    }
  }
}

/* ==================== 왼쪽: 로그인 폼 섹션 ==================== */
.login-form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-10;
  max-width: 468px;
  height: 125% !important;

  @media (max-width: $breakpoint-phone) {
    width: 100%;
    max-width: 100%;
    height: auto !important;
    padding: $spacing-5;
    transform: none !important;
  }
}

.login-container {
  width: 100%;
  animation: slideUp 0.5s ease-out;
}

/* ==================== 헤더 ==================== */
.login-header {
  margin-bottom: $spacing-10;
  text-align: center;
}

.login-title {
  font-size: 2rem;
  font-weight: $font-weight-bold;
  color: #7f7f7f;
  margin-bottom: $spacing-5;
  animation: fadeInDown 0.6s ease-out 0.2s both;

  @media (max-width: $breakpoint-phone) {
    font-size: $font-size-3xl;
  }
}

.login-subtitle {
  font-size: $font-size-xl;
  color: $secondary-text;
  line-height: 1.6;
  animation: fadeInUp 0.6s ease-out 0.3s both;

  @media (max-width: $breakpoint-phone) {
    font-size: $font-size-base;
  }
}

/* ==================== 폼 ==================== */
.login-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 35px;

  @media (max-width: $breakpoint-phone) {
    margin-bottom: $spacing-6;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;
  margin-bottom: 31px;
  animation: slideUp 0.5s ease-out 0.4s both;

  @media (max-width: $breakpoint-phone) {
    margin-bottom: $spacing-6;
  }
}

/* ==================== 에러 메시지 ==================== */
.form-error {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  padding: $spacing-3;
  background-color: rgba($red, 0.1);
  border-left: 4px solid $red;
  border-radius: $border-radius-custom;
  color: $red;
  font-size: $font-size-sm;
  animation: slideDown 0.3s ease-out;
}

/* ==================== 체크박스 ==================== */
.remember-email-checkbox {
  margin-top: $spacing-xs;
  margin-bottom: $spacing-10;
  margin-left: $spacing-1;
  animation: fadeIn 0.5s ease-out 0.5s both;
}

/* ==================== 하단 링크 ==================== */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-xs;
  text-align: center;
  font-size: $font-size-sm;
  color: $secondary-text;
  animation: fadeIn 0.5s ease-out 0.6s both;
}

.link-button {
  background: none;
  border: none;
  color: $gray-500;
  cursor: pointer;
  font-size: $font-size-sm;
  text-decoration: none;
  transition: all $transition-base;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.login-button {
  border-radius: 25px;
  margin-bottom: 20px;

  @media (max-width: $breakpoint-phone) {
    height: 52px;
    font-size: $font-size-lg;
  }
}

.divider {
  color: $gray-300;
}

/* ==================== 오른쪽: 배경 그래픽 섹션 ==================== */
.login-graphic-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 25px;

  @media (max-width: $breakpoint-phone) {
    display: none;
  }
}

.graphic-background {
  width: 100%;
  height: 100%;
  background-image: var(
    --login-pannel-image,
    url("@/assets/images/banner/pannel.png")
  );
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 25px;
  animation: fadeIn 0.5s ease-out 0.6s both;
}
</style>
