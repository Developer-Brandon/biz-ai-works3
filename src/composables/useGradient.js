/**
 * useGradient.js
 *
 * 목적:
 * - 동적 그래디언트 관리
 * - hex code 값 기반으로 그래디언트 생성
 * - CSS-in-JS 방식으로 런타임에 동적 적용
 */

import { ref, computed } from "vue";
import { isValidHex } from "@/utils/common";

export function useGradient() {
  // ==================== 반응형 상태 ====================

  /**
   * gradientStartColor
   * - 그래디언트 시작 색상
   */
  const gradientStartColor = ref("");

  /**
   * gradientEndColor
   * - 그래디언트 종료 색상
   */
  const gradientEndColor = ref("");

  /**
   * gradientAngle
   * - 그래디언트 방향 각도
   * - 기본값: 135 (좌상단 → 우하단)
   * - 범위: 0 ~ 360
   */
  const gradientAngle = ref(135);

  // ==================== 계산된 속성 (Computed) ====================

  /**
   * gradientStyle
   *
   * 계산된 속성: 반응형 색상/각도를 바탕으로 CSS 그래디언트 문자열 생성
   *
   * 반환 예시:
   * "linear-gradient(135deg, #FFE6F0 0%, #FFFFFF 100%)"
   */
  const gradientStyle = computed(() => {
    return `linear-gradient(${gradientAngle.value}deg, ${gradientStartColor.value} 0%, ${gradientEndColor.value} 100%)`;
  });

  /**
   * gradientObject
   *
   * 스타일 객체 형식 (v-bind:style에 직접 사용 가능)
   *
   * 사용 예시:
   * <div :style="gradientObject"></div>
   */
  const gradientObject = computed(() => ({
    background: gradientStyle.value,
  }));

  // ==================== 메서드 (Methods) ====================
  /**
   * setGradient(startColor, endColor, angle)
   *
   * 그래디언트 설정 함수
   *
   * 동작:
   * 1. 색상 코드 유효성 검사
   * 2. 유효한 경우만 반응형 상태 업데이트
   * 3. 콘솔에 로깅 (개발 디버깅용)
   *
   * @param {string} startColor - 시작 색상 (#RRGGBB 형식)
   * @param {string} endColor - 종료 색상 (#RRGGBB 형식)
   * @param {number} angle - 그래디언트 각도 (기본값: 135)
   * @returns {boolean} 설정 성공 여부
   *
   * 사용 예시:
   * setGradient('#FFE6F0', '#FFFFFF', 135)
   */
  const setGradient = (startColor, endColor, angle = 135) => {
    console.log("Gradient 설정 시도:", { startColor, endColor, angle });

    // 유효성 검사
    if (!isValidHex(startColor)) {
      console.error(`❌ 시작 색상 유효하지 않음: ${startColor}`);
      return false;
    }

    if (!isValidHex(endColor)) {
      console.error(`❌ 종료 색상 유효하지 않음: ${endColor}`);
      return false;
    }

    // 각도 범위 검사 (0 ~ 360)
    if (angle < 0 || angle > 360) {
      console.warn(`⚠️ 각도가 범위를 벗어남. 기본값 135로 설정합니다.`);
      angle = 135;
    }

    // 반응형 상태 업데이트
    gradientStartColor.value = startColor;
    gradientEndColor.value = endColor;
    gradientAngle.value = angle;

    console.log("✅ Gradient 설정 완료:", gradientStyle.value);
    return true;
  };

  // ==================== Return (Composable이 제공하는 API) ====================

  return {
    // 반응형 상태
    gradientStartColor,
    gradientEndColor,
    gradientAngle,
    // 계산된 속성
    gradientStyle,
    gradientObject,
    // 메서드
    setGradient,
  };
}
