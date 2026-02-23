<!-- src/components/main/card/AgentCard.vue -->
<template>
  <div
    class="agent-card"
    :class="{ 'agent-card--faq': type === 'faq' }"
    role="button"
    tabindex="0"
  >
    <!-- ==================== NORMAL 타입 (아이콘 + 제목 + 설명) ==================== -->
    <template v-if="type === 'normal'">
      <div class="card-background"></div>
      <div class="card-content" @click="selectAgent">
        <div class="agent-icon-wrapper">
          <CommonIcon :src="cardThumbnailUrl" :size="100" />
        </div>
        <h3 class="agent-name">
          {{ cardInfo.name }}
        </h3>
        <p class="agent-description">
          {{ cardInfo.description }}
        </p>
      </div>
    </template>

    <!-- ==================== FAQ 타입 (배경색 + 제목 + 질문 리스트) ==================== -->
    <template v-else-if="type === 'faq'">
      <div
        class="card-content card-content--faq"
        :style="{
          backgroundColor: configStore.mainHoverColorHexCode,
        }"
      >
        <h3 class="agent-name">
          {{ cardInfo.name }}
        </h3>
        <ul class="faq-list">
          <li
            class="faq"
            v-for="(question, index) in randomQuestions"
            :key="index"
            @click="selectAgentFaq(question)"
          >
            {{ question.contents }}
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import CommonIcon from "@/components/icon/CommonIcon.vue";
import { useConfigStore } from "@/stores/useConfigStore";
import { useDataStore } from "@/stores/model/dataStore";
import { useAgentStore } from "@/stores/model/module/useAgentStore";
import { useFileStore } from "@/stores/model/module/useFileStore";

const props = defineProps({
  cardIndex: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  cardInfo: {
    type: Object,
    default: () => ({
      id: "",
      title: "",
      explain: "",
      questionList: [],
    }),
  },
});

const emit = defineEmits(["agent-select"]);

const configStore = useConfigStore();
const agentStore = useAgentStore();
const fileStore = useFileStore();

const cardInfo = computed(() => {
  console.log("AgentCard cardInfo:", props.cardInfo);
  return props.cardInfo;
});

const cardThumbnailUrl = computed(() => {
  console.log("cardThumbnailUrl computed 호출");
  console.log("  configStore.isConfigLoaded:", configStore.isConfigLoaded);
  console.log("  configStore.imageServerUrl:", configStore.imageServerUrl);
  console.log(
    "  cardInfo.value.cardThumbnailUrl:",
    cardInfo.value?.cardThumbnailUrl,
  );

  if (!configStore.isConfigLoaded) {
    console.warn("configStore 아직 로드되지 않음 - 상대경로 그대로 반환");
    return cardInfo.value?.cardThumbnailUrl || "";
  }

  if (!cardInfo.value?.cardThumbnailUrl) {
    console.warn("cardThumbnailUrl 없음");
    return "";
  }

  if (!configStore.imageServerUrl) {
    console.warn("imageServerUrl 없음 - 상대경로 그대로 반환");
    return cardInfo.value.cardThumbnailUrl;
  }

  const thumbPath =
    configStore.imageServerUrl + cardInfo.value.cardThumbnailUrl;
  console.log("카드 썸네일 경로 (절대경로):", thumbPath);

  return thumbPath;
});

const randomQuestions = computed(() => {
  if (!cardInfo.value?.questionList) return [];
  return [...cardInfo.value.questionList]
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
});

const selectAgent = async () => {
  console.group("[selectAgent] Card 선택");
  console.log(`카드 인덱스: ${props.cardIndex}, 타입: ${props.type}`);
  console.log(`카드 정보:`, cardInfo.value);
  try {
    console.log("1.AI Agent 정보 저장");
    const agentName = cardInfo.value.name;
    const agentData = {
      agentId: cardInfo.value.id,
      name: agentName,
    };
    agentStore.addAgentTag(agentName, agentData);

    let questionMessage = "";

    if (props.cardIndex === 0) {
      questionMessage = " ";
    } else if (props.cardIndex === 1) {
      questionMessage = " ";
    } else if (props.cardIndex === 2) {
      // selectAgentFaq 메소드로 분리
    }

    console.log("메시지 준비됨:", questionMessage);
    console.log("태그 표시 플래그 설정");
    fileStore.isFromCard = true;
    console.log("isFromCard = true (태그 표시)");

    console.log("emit('agent-select') 호출");
    emit("agent-select", {
      cardIndex: props.cardIndex,
      type: props.type,
      agentName: agentName,
      agentData: agentData,
      message: questionMessage,
    });

    console.log("Card 선택 완료");
    console.groupEnd();

    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (error) {
    console.error("Card 선택 실패:", error);
    console.groupEnd();
  }
};

const selectAgentFaq = async (agentData) => {
  console.group("[selectAgentFaq] FAQ 질문 선택");
  console.log("agentData.agentId:", agentData.agentId);
  console.log("agentData.contents:", agentData.contents);
  console.log("현재 cardInfo:", cardInfo.value);

  try {
    const agentName = configStore.aiAgentCards.find(
      (card) => card.id === agentData.agentId,
    )?.name;

    console.log("Agent 찾음:", agentName);
    agentStore.addAgentTag(agentName, {
      agentId: agentData.agentId,
      name: agentName,
    });
    console.log("emit('agent-select') 발생");
    fileStore.isFromCard = true;
    emit("agent-select", {
      cardIndex: props.cardIndex,
      type: props.type,
      agentName: agentName,
      agentData: agentData,
      message: agentData.contents?.replace(/^Q\.\s*/, ""),
    });

    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("selectAgentFaq 완료");
    console.groupEnd();
  } catch (error) {
    console.error("selectAgentFaq 실패:", error.message);
    console.groupEnd();
  }
};
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables" as *;
@use "@/assets/styles/whole_animations" as *;

/* ==================== .agent-card - 메인 컨테이너 ==================== */

.agent-card {
  width: 315px;
  height: 250px;
  position: relative;
  border-radius: $border-radius-custom;
  overflow: hidden;
  cursor: pointer;
  perspective: 1000px;
  background: $white;
  border: 1px solid $gray-200;
  box-shadow:
    $shadow-base,
    0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  &:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(-4px);
  }
}

/* ==================== .card-background ==================== */

.card-background {
  background: $white;
  pointer-events: none;
}

/* ==================== .card-content (NORMAL 타입 공통) ==================== */

.card-content {
  position: relative;
  z-index: 1;
  padding: $spacing-5;
  display: flex;
  flex-direction: column;
  align-items: center; /* 가로 중앙 정렬 */
  justify-content: center; /* 세로 중앙 정렬 - 이 속성이 없어서 상단 쏠림이 발생했던 것 */
  text-align: center;
  gap: $spacing-4;
  width: 100%;
  height: 100%; /* 부모(.agent-card)의 height: 250px를 꽉 채워야 justify-content가 동작 */

  @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
    padding: $spacing-8;
  }

  @media (max-width: 768px) {
    padding: $spacing-8;
  }
}

/* ==================== Normal 타입 스타일 ==================== */

.agent-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform $transition-base;

  .agent-card:hover & {
    transform: rotate(10deg) scale(1.05);
  }
}

.agent-name {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $primary-text;
  margin: $spacing-2 0 0 0;
  line-height: 1.3;

  @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
    font-size: $font-size-2xl;
  }

  @media (max-width: 768px) {
    font-size: $font-size-xl;
  }
}

.agent-description {
  font-size: $font-size-sm;
  color: $secondary-text;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;

  @media (max-width: 768px) {
    font-size: $font-size-base;
  }
}

/* ==================== FAQ 타입 전용 스타일 ==================== */

.agent-card--faq {
  cursor: default;

  .card-content {
    /*
     * FAQ 타입도 동일하게 세로 중앙 정렬 적용
     * .card-content의 justify-content: center를 상속받아 동작하지만
     * FAQ 특성상 내용이 많아 위쪽 여백이 필요하므로 justify-content를 flex-start로 덮어씀
     */
    justify-content: flex-start;
    padding: 1.5rem;
    margin-top: -1px;

    @media (min-width: $more-than-breakpoint-phone) and (max-width: $breakpoint-desktop-x-large-screen) {
      padding: 1.6rem;
    }

    .agent-name {
      font-size: 1.4rem;
      font-weight: 700;
      color: $primary-text;
      margin-top: 10px;
    }

    .faq-list {
      list-style: none;
      padding: 0;
      margin: 0 auto;
      width: 90%;
      cursor: pointer;

      .faq {
        width: 100%;
        font-size: 13px;
        color: $primary-text;
        line-height: 1.2;
        padding: 8px 16px;
        background-color: $white;
        border-radius: 27px;
        text-align: left;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: block;

        &:hover {
          color: $white;
          background-color: var(--primary-color);
          transition: $transition-base;
        }
      }
    }
  }
}
</style>
