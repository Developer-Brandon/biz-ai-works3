<!-- src/pages/NotConfigured.vue -->
<template>
  <div class="not-configured-container">
    <div class="content-wrapper">
      <!-- 아이콘 애니메이션 -->
      <div class="error-icon">
        <svg
          class="icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- 바깥 원 -->
          <circle cx="12" cy="12" r="10" />
          <!-- 느낌표 상단 선 -->
          <path d="M12 7v5" />
          <!-- 느낌표 하단 점 (fill로 채워진 circle) -->
          <circle cx="12" cy="16.5" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      </div>

      <!-- 에러 코드 텍스트 -->
      <div class="error-code">
        <span class="digit" :style="{ animationDelay: '0s' }">N</span>
        <span class="digit" :style="{ animationDelay: '0.1s' }">o</span>
        <span class="digit" :style="{ animationDelay: '0.2s' }">t</span>
        <span class="digit spacer" :style="{ animationDelay: '0.25s' }"> </span>
        <span class="digit" :style="{ animationDelay: '0.3s' }">C</span>
        <span class="digit" :style="{ animationDelay: '0.4s' }">o</span>
        <span class="digit" :style="{ animationDelay: '0.5s' }">n</span>
        <span class="digit" :style="{ animationDelay: '0.6s' }">f</span>
        <span class="digit" :style="{ animationDelay: '0.7s' }">i</span>
        <span class="digit" :style="{ animationDelay: '0.8s' }">g</span>
      </div>

      <!-- 메인 메시지 -->
      <h1 class="main-message">
        <span class="word" :style="{ animationDelay: '0.9s' }">
          서버 환경 설정이 완료되지 않았습니다
        </span>
      </h1>

      <!-- 서브 메시지 -->
      <p class="sub-message">
        서버 환경 설정이 완료되지 않아 서비스를 시작할 수 없습니다.<br />
        관리자에게 문의해 주세요.
      </p>

      <!-- 버튼 그룹 -->
      <div class="button-group">
        <button @click="retryLoad" class="btn btn-retry">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M23 4v6h-6" />
            <path d="M1 20v-6h6" />
            <path
              d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"
            />
          </svg>
          <span>다시 시도</span>
        </button>
      </div>

      <!-- 장식 요소들 -->
      <div class="decoration-dots">
        <span
          class="dot"
          v-for="i in 12"
          :key="i"
          :style="{ animationDelay: `${i * 0.1}s` }"
        ></span>
      </div>
    </div>

    <!-- 배경 그리드 -->
    <div class="background-grid">
      <div class="grid-line" v-for="i in 20" :key="`line-${i}`"></div>
    </div>
  </div>
</template>

<script setup>
/**
 * NotConfigured.vue - 서버 설정 미완료 에러 페이지
 *
 * 표시 조건:
 * - App.vue의 fetchConfig() 실패 시 이 페이지로 라우팅
 *
 * 버튼:
 * - 다시 시도: 페이지 새로고침으로 fetchConfig 재시도
 */
import { useRouter } from "vue-router";

const router = useRouter();

/**
 * retryLoad: 페이지 새로고침으로 fetchConfig 재시도
 * window.location.reload()를 사용하여 App.vue의 초기화 과정을 처음부터 다시 실행
 */
const retryLoad = () => {
  router.push("/");
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

.not-configured-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  overflow: hidden;
  padding: 2rem;
}

/* 배경 그리드 */
.background-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  opacity: 0.03;
  pointer-events: none;
}

.grid-line {
  border-right: 1px solid $white;
  animation: gridPulse 3s ease-in-out infinite;
}

.grid-line:nth-child(even) {
  animation-delay: 1.5s;
}

@keyframes gridPulse {
  0%,
  100% {
    opacity: 0.03;
  }
  50% {
    opacity: 0.08;
  }
}

/* 메인 컨텐츠 */
.content-wrapper {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
}

/* 경고 아이콘 */
.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
  opacity: 0;
  animation: fadeInDown 0.8s ease-out 0s forwards;

  .icon-svg {
    width: clamp(4rem, 8vw, 6rem);
    height: clamp(4rem, 8vw, 6rem);
    color: $white;
    /* 아이콘 테두리 glow 효과 */
    filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
    animation: iconPulse 2.5s ease-in-out infinite;
  }
}

@keyframes iconPulse {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.6));
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Not Config 텍스트 */
.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.2rem;
  margin-bottom: 2rem;
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 800;
  line-height: 1;
}

.digit {
  color: $white;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
  text-shadow:
    0 0 20px rgba(255, 255, 255, 0.3),
    0 0 40px rgba(255, 255, 255, 0.1);

  /* 공백 글자 */
  &.spacer {
    width: 1.5rem;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 메인 메시지 */
.main-message {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  font-weight: 700;
  margin: 0 0 1.5rem;
  display: flex;
  justify-content: center;
}

.word {
  color: $white;
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, $white, transparent);
    opacity: 0;
    animation: underlineSlide 0.8s ease-out forwards;
    animation-delay: inherit;
  }
}

@keyframes underlineSlide {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.3;
    transform: scaleX(1);
  }
}

/* 서브 메시지 */
.sub-message {
  color: #999999;
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.8;
  margin: 0 0 3rem;
  opacity: 0;
  animation: fadeIn 0.8s ease-out 1.2s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 버튼 그룹 */
.button-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  opacity: 0;
  animation: fadeInUp 0.8s ease-out 1.4s forwards;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  background: transparent;
  color: $white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 2px solid #333333;
  border-radius: 25px;

  &::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s,
      height 0.6s;
  }

  &:hover::before {
    width: 300px;
    height: 300px;
  }

  &:hover {
    border-color: #666666;
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    position: relative;
    z-index: 1;
    transition: transform 0.3s;
  }

  /* 다시 시도 버튼 hover 시 아이콘 회전 */
  &:hover svg {
    transform: rotate(180deg);
  }

  span {
    position: relative;
    z-index: 1;
  }
}

/* 장식 점들 */
.decoration-dots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
  pointer-events: none;
}

.dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: $white;
  border-radius: 50%;
  opacity: 0;
  animation: dotFloat 3s ease-in-out infinite;
}

.dot:nth-child(1) {
  top: 10%;
  left: 20%;
}
.dot:nth-child(2) {
  top: 20%;
  left: 80%;
}
.dot:nth-child(3) {
  top: 30%;
  left: 10%;
}
.dot:nth-child(4) {
  top: 40%;
  left: 90%;
}
.dot:nth-child(5) {
  top: 50%;
  left: 5%;
}
.dot:nth-child(6) {
  top: 60%;
  left: 95%;
}
.dot:nth-child(7) {
  top: 70%;
  left: 15%;
}
.dot:nth-child(8) {
  top: 80%;
  left: 85%;
}
.dot:nth-child(9) {
  top: 15%;
  left: 50%;
}
.dot:nth-child(10) {
  top: 85%;
  left: 50%;
}
.dot:nth-child(11) {
  top: 25%;
  left: 40%;
}
.dot:nth-child(12) {
  top: 75%;
  left: 60%;
}

@keyframes dotFloat {
  0%,
  100% {
    opacity: 0;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translateY(-20px) scale(1.2);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .not-configured-container {
    padding: 1.5rem;
  }

  .error-code {
    gap: 0.1rem;
    margin-bottom: 1.5rem;
  }

  .sub-message {
    margin-bottom: 2rem;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .decoration-dots {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 2.5rem;
  }

  .btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
  }
}
</style>
