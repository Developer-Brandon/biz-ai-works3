<!-- src/components/sidebar/MainSidebar.vue -->
<template>
  <!-- 
    ========================================
    Mobile Overlay (모바일에서만 표시)
    ========================================
  -->
  <div
    v-if="isMobileView && isOpen"
    class="sidebar-overlay"
    @click="closeSidebar"
  />

  <!-- 
    ========================================
    Main Sidebar Component
    ========================================
  -->
  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <!-- ==================== 로고 섹션 ==================== -->
    <div class="sidebar__header">
      <div class="sidebar__logo">
        <img
          :src="logoImageUrl"
          alt="Biz.AI Logo"
          class="sidebar__logo-image"
          @click="reloadPage"
        />
      </div>
    </div>

    <!-- ==================== 새 채팅 버튼 ==================== -->
    <button
      class="sidebar__new-chat-button"
      @click="startNewChat"
      :disabled="isCreatingRoom"
    >
      <span class="sidebar__new-chat-text">
        {{ isCreatingRoom ? "생성 중..." : "새 채팅" }}
      </span>
    </button>

    <!-- ==================== 검색창 ==================== -->
    <div class="sidebar__search">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="검색어를 입력해주세요"
        class="sidebar__search-input"
        @input="handleSearch"
      />
      <img
        class="sidebar__search-icon"
        src="@/assets/images/icon/reading_grasses.png"
      />
    </div>

    <!-- ==================== 채팅 히스토리 섹션 ==================== -->
    <div class="sidebar__history">
      <!-- 로딩 중 ==================== -->
      <div v-if="isLoadingChatRooms" class="sidebar__loading">
        <p class="sidebar__loading-text">채팅 목록을 불러오는 중...</p>
      </div>

      <!-- 채팅이 있는 경우 ==================== -->
      <template v-else-if="filteredChatSections.length > 0">
        <section
          v-for="section in filteredChatSections"
          :key="section.id"
          class="sidebar__history-section"
        >
          <!-- 섹션 제목 (그룹명) -->
          <div class="sidebar__history-section-header">
            <h3 class="sidebar__history-section-title">
              {{ section.title }}
              <span class="sidebar__history-section-count">
                ({{ section.chats.length }})
              </span>
            </h3>
            <!-- 접기/펼치기 버튼 (옵션) -->
            <button
              v-if="section.chats.length > 0"
              class="sidebar__history-section-toggle"
              @click="toggleSection(section.id)"
              :aria-label="collapsedSections[section.id] ? '펼치기' : '접기'"
            >
              {{ collapsedSections[section.id] ? "▸" : "▾" }}
            </button>
          </div>

          <!-- 섹션 내 채팅 목록 (접힌 상태면 숨김) -->
          <ul
            v-show="!collapsedSections[section.id]"
            class="sidebar__chat-list"
          >
            <li
              v-for="chat in section.chats"
              :key="chat.id"
              class="sidebar__chat-item"
              :class="{
                'sidebar__chat-item--active': chat.id === activeChatId,
              }"
              @click="selectChat(chat)"
            >
              <!-- 채팅 제목 -->
              <span
                class="sidebar__chat-title"
                v-if="editingChatId !== chat.id"
              >
                {{ chat.title }}
              </span>

              <!-- 편집 모드: 제목 입력 필드 -->
              <input
                v-if="editingChatId === chat.id"
                :key="`edit-${chat.id}`"
                :data-chat-id="chat.id"
                v-model="editingTitle"
                class="sidebar__chat-edit-input"
                type="text"
                @keydown="handleChatTitleKeydown($event, chat.id)"
                @blur="saveEditingChat(chat.id)"
                @click.stop
                placeholder="새로운 제목 입력..."
              />

              <!-- 호버 시 우측 메뉴 버튼 -->
              <div class="sidebar__chat-actions">
                <!-- 편집 모드가 아닐 때만 메뉴 버튼 표시 -->
                <button
                  v-if="editingChatId !== chat.id"
                  class="sidebar__chat-action-button"
                  @click.stop="showContextMenu($event, chat.id)"
                  title="채팅히스토리_옵션"
                >
                  ⋯
                </button>
              </div>
            </li>
          </ul>
        </section>
      </template>

      <!-- 채팅이 없는 경우 ==================== -->
      <div v-else class="sidebar__empty">
        <p class="sidebar__empty-text">채팅이 없습니다.</p>
      </div>
    </div>

    <!-- ==================== SideBar Footer (사용자 정보) ==================== -->
    <div class="sidebar__footer">
      <!-- 사용자 프로필 -->
      <button
        class="sidebar__footer__user-profile"
        @click="showUserMenu($event)"
      >
        <img :src="defaultProfileImage" alt="프로필" class="user-avatar" />
        <div class="user-info">
          <!-- {{ userName }} -->
          <span class="name">홍길동</span>
          <span class="role">manager</span>
        </div>
      </button>
    </div>
  </aside>

  <!-- =============== 우측 메뉴 (Context Menu) - 채팅 =============== -->
  <Teleport to="body" v-if="contextMenu.isVisible">
    <div class="sidebar__context-menu-overlay" @click="closeContextMenu" />
    <div
      class="sidebar__context-menu"
      :style="{
        top: contextMenu.position.top,
        left: contextMenu.position.left,
      }"
    >
      <!-- 메뉴 항목: 이름 바꾸기 -->
      <button
        class="sidebar__context-menu-item"
        @click="
          startEditingChat(
            contextMenu.chatId,
            getChatById(contextMenu.chatId)?.title || '',
          )
        "
      >
        <span class="sidebar__context-menu-icon">
          <img :src="pencilIcon" />
        </span>
        <span class="sidebar__context-menu-text">이름 바꾸기</span>
      </button>

      <!-- 메뉴 항목: 삭제 -->
      <button
        class="sidebar__context-menu-item"
        @click="
          deleteChat(contextMenu.chatId);
          closeContextMenu();
        "
      >
        <span class="sidebar__context-menu-icon">
          <img :src="garbageIcon" />
        </span>
        <span class="sidebar__context-menu-text">삭제</span>
      </button>
    </div>
  </Teleport>

  <!-- =============== 우측 메뉴 (Context Menu) - 사용자 메뉴 =============== -->
  <Teleport to="body" v-if="userMenu.isVisible">
    <div class="sidebar__context-menu-overlay" @click="closeUserMenu()" />
    <div
      class="sidebar__context-menu"
      :style="{
        top: userMenu.position.top,
        left: userMenu.position.left,
      }"
    >
      <!-- 메뉴 항목: 로그아웃 -->
      <button
        class="sidebar__context-menu-item"
        @click="
          logout();
          closeUserMenu();
        "
      >
        <span class="sidebar__context-menu-text">로그아웃</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup>
/**
 * ========================================
 * MainSidebar.vue - 좌측 사이드바 컴포넌트
 * ========================================
 */

import { ref, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConfigStore } from "@/stores/useConfigStore";
import { useDataStore } from "@/stores/model/dataStore";
import { useRoomStore } from "@/stores/model/module/useRoomStore";

import {
  getChatRoomList,
  updateChatRoomTitle,
  deleteChatRoom,
} from "@/api/modules/chatRoomApi";

import garbageIcon from "@/assets/images/icon/garbage.png";
import pencilIcon from "@/assets/images/icon/pencil.png";

/* ==================== Props & Emits ==================== */

defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "refresh-main-page"]);

/* ==================== 라우터 및 스토어 ==================== */

const router = useRouter();
const authStore = useAuthStore();
const roomStore = useRoomStore();
const dataStore = useDataStore();
const { logoImageUrl, defaultProfileImage } = useConfigStore();

/* ==================== 반응형 상태 (State) ==================== */

const isMobileView = ref(false);
const searchQuery = ref("");
const activeChatId = ref(null);
const chatRooms = ref([]);
const isLoadingChatRooms = ref(false);
const isCreatingRoom = ref(false);

// 각 섹션의 접기/펼치기 상태 관리
const collapsedSections = ref({
  today: false,
  recent: false,
  older: false,
});

const contextMenu = ref({
  isVisible: false,
  chatId: null,
  position: { top: "0px", left: "0px" },
});

const userMenu = ref({
  isVisible: false,
  position: { top: "0px", left: "0px" },
});

const editingChatId = ref(null);
const editingTitle = ref("");

/* ==================== 유틸리티 함수 ==================== */

/**
 * ✅ 날짜 분류 헬퍼 함수 (수정본)
 */
const classifyDateGroup = (dateString) => {
  if (!dateString) {
    console.warn('⚠️ dateString이 없습니다. "이전" 그룹으로 분류');
    return "older";
  }

  // 1. 채팅방의 업데이트 시간을 Date 객체로 변환
  const chatDate = new Date(dateString);

  // 2. 현재 시간 (한국시간 기준)
  const now = new Date();

  // 3. 오늘 자정 (00:00:00) 시각 계산
  // - getFullYear(), getMonth(), getDate()로 년/월/일만 추출
  // - 시/분/초는 0으로 설정되어 자정 시각이 됨
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0, // 시
    0, // 분
    0, // 초
    0, // 밀리초
  );

  // 4. 7일 전 자정 (00:00:00) 시각 계산
  const sevenDaysAgoMidnight = new Date(todayMidnight);
  sevenDaysAgoMidnight.setDate(todayMidnight.getDate() - 7);

  // 디버깅용 로그
  console.log("날짜 분류 디버깅:", {
    chatDate: chatDate.toISOString(),
    todayMidnight: todayMidnight.toISOString(),
    sevenDaysAgoMidnight: sevenDaysAgoMidnight.toISOString(),
    chatDateTime: chatDate.getTime(),
    todayMidnightTime: todayMidnight.getTime(),
    sevenDaysAgoMidnightTime: sevenDaysAgoMidnight.getTime(),
  });

  // 5. 날짜 비교 (시간값(timestamp)으로 비교)
  const chatTime = chatDate.getTime();
  const todayTime = todayMidnight.getTime();
  const sevenDaysAgoTime = sevenDaysAgoMidnight.getTime();

  if (chatTime >= todayTime) {
    // 오늘 자정(00:00:00) 이후 ~ 현재까지
    console.log('✅ "오늘" 그룹으로 분류');
    return "today";
  } else if (chatTime >= sevenDaysAgoTime) {
    // 오늘 자정(00:00:00) 이전 ~ 7일 전 자정(00:00:00) 사이
    console.log('✅ "최근" 그룹으로 분류');
    return "recent";
  } else {
    // 7일 전 자정(00:00:00) 이전
    console.log('✅ "이전" 그룹으로 분류');
    return "older";
  }
};

/**
 * ✅ 채팅방을 날짜 그룹별로 분류하는 함수
 *
 * @param {Array} chats - 채팅방 목록
 * @returns {Object} - 그룹별로 분류된 채팅방 객체
 *
 * Vue 2와의 차이점:
 * - Vue 2: forEach 대신 for...of 루프를 사용하거나 map/filter 등을 사용
 * - Vue 3: forEach도 여전히 사용 가능하지만, 성능상 for...of가 더 나을 수 있음
 */
const groupChatsByDate = (chats) => {
  console.log("채팅방 그룹화 시작:", chats.length, "개");

  const groups = {
    today: [],
    recent: [],
    older: [],
  };

  chats.forEach((chat) => {
    // updatedAt 또는 createdAt 필드를 기준으로 분류
    const dateString = chat.updatedAt || chat.createdAt;

    console.log(" 채팅방 분류 중:", {
      id: chat.id,
      title: chat.title,
      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt,
      dateString: dateString,
    });

    const group = classifyDateGroup(dateString);
    groups[group].push(chat);

    console.log(`✅ "${chat.title}" → "${group}" 그룹에 추가됨`);
  });

  console.log("그룹화 완료:", {
    today: groups.today.length,
    recent: groups.recent.length,
    older: groups.older.length,
  });

  return groups;
};

/* ==================== 계산된 속성 (Computed) ==================== */

const userName = computed(() => authStore.user?.name || "User");

/**
 * ✅ filteredChatSections: 검색어 기반으로 필터링되고 날짜별로 그룹화된 채팅 섹션
 *
 * Vue 2와의 차이점:
 * - Vue 2: computed 속성은 options API의 computed 객체 내에 함수로 정의
 *   예) computed: { filteredChatSections() { ... } }
 * - Vue 3: Composition API에서는 computed() 함수로 래핑하여 사용
 *   예) const filteredChatSections = computed(() => { ... })
 */
const filteredChatSections = computed(() => {
  console.log("filteredChatSections 계산 시작");

  // 1. 검색어로 필터링
  let filteredChats = chatRooms.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filteredChats = chatRooms.value.filter((chat) =>
      chat.title.toLowerCase().includes(query),
    );
    console.log(` 검색어 "${query}"로 필터링: ${filteredChats.length}개`);
  }

  // 2. 날짜별로 그룹화
  const groupedChats = groupChatsByDate(filteredChats);

  // 3. 섹션 배열 생성 (빈 그룹은 제외)
  const sections = [];

  // 오늘
  if (groupedChats.today.length > 0) {
    sections.push({
      id: "today",
      title: "오늘",
      chats: groupedChats.today,
    });
    console.log('✅ "오늘" 섹션 추가:', groupedChats.today.length, "개");
  }

  // 최근 (7일)
  if (groupedChats.recent.length > 0) {
    sections.push({
      id: "recent",
      title: "최근",
      chats: groupedChats.recent,
    });
    console.log('✅ "최근" 섹션 추가:', groupedChats.recent.length, "개");
  }

  // 이전 (7일 이전)
  if (groupedChats.older.length > 0) {
    sections.push({
      id: "older",
      title: "이전",
      chats: groupedChats.older,
    });
    console.log('✅ "이전" 섹션 추가:', groupedChats.older.length, "개");
  }

  console.log("채팅 그룹화 최종 결과:", {
    total: filteredChats.length,
    today: groupedChats.today.length,
    recent: groupedChats.recent.length,
    older: groupedChats.older.length,
    sections: sections.length,
  });

  return sections;
});

/* ==================== 메서드 (Methods) ==================== */

const closeSidebar = () => {
  console.log("Sidebar 닫기 요청");
  emit("close");
};

/**
 * ✅ toggleSection: 섹션 접기/펼치기
 *
 * @param {string} sectionId - 섹션 ID ('today', 'recent', 'older')
 */
const toggleSection = (sectionId) => {
  collapsedSections.value[sectionId] = !collapsedSections.value[sectionId];
  console.log(
    `섹션 토글: ${sectionId} → ${
      collapsedSections.value[sectionId] ? "접힘" : "펼침"
    }`,
  );
};

const initToggleSections = () => {
  Object.keys(collapsedSections.value).forEach((key) => {
    console.log(`섹션 초기화: ${key} 펼침`);
    if (key === "recent" || key === "older") {
      collapsedSections.value[key] = true; // 최근, 이전 섹션은 기본 접힘
      return;
    }
    collapsedSections.value[key] = false;
  });
  console.log("섹션 초기화: 모두 펼침");
};

/**
 * startNewChat: 새 채팅 생성 (API 호출)
 *
 *  수정 (v3):
 * - ❌ 새로운 채팅방이므로 Agent 데이터 초기화! ← 핵심!
 * - ❌ 기존 메시지 초기화! ← 핵심!
 */
const startNewChat = async () => {
  activeChatId.value = null;
  emit("refresh-main-page");
};
/**
 * ✅ selectChat: 채팅 선택 (roomId 저장 기능 추가)
 *
 * 핵심 변경:
 * - roomStore.setRoomId(chat.id) 호출
 * - MainPage의 watch가 자동으로 chatRoomDetail 로드
 */
const selectChat = (chat) => {
  console.log("채팅 선택:", chat.title);

  roomStore.setRoomId(chat.id);

  activeChatId.value = chat.id;

  if (isMobileView.value) {
    closeSidebar();
  }
};

const getChatById = (chatId) => {
  return chatRooms.value.find((chat) => chat.id === chatId);
};

/**
 * deleteChat: 채팅 삭제 (API 호출)
 */
const deleteChat = async (chatId) => {
  console.log("채팅 삭제:", chatId);

  if (!confirm("이 채팅을 삭제하시겠습니까?")) {
    console.log("❌ 삭제 취소됨");
    return;
  }

  try {
    const result = await deleteChatRoom(chatId);

    console.log("✅ 채팅 삭제 성공:", result);

    chatRooms.value = chatRooms.value.filter((chat) => chat.id !== chatId);

    if (activeChatId.value === chatId) {
      activeChatId.value = null;
      // ✅ 삭제한 채팅이 선택되어 있었으면 roomId 초기화
      roomStore.setRoomId("");
    }
  } catch (error) {
    console.error("❌ 채팅 삭제 실패:", error);
    alert("채팅을 삭제할 수 없습니다. 다시 시도해주세요.");
  }
};

const handleSearch = () => {
  console.log(" 검색:", searchQuery.value);
};

const logout = () => {
  console.log("로그아웃");
  authStore.logout();
  router.push("/login");
};

/* ==================== Context Menu 메서드 ==================== */

const showContextMenu = (event, chatId) => {
  event.preventDefault();
  event.stopPropagation();

  console.log("Context Menu 열기:", chatId);

  contextMenu.value = {
    isVisible: true,
    chatId: chatId,
    position: {
      top: `${event.pageY}px`,
      left: `${event.pageX}px`,
    },
  };
};

const closeContextMenu = () => {
  contextMenu.value.isVisible = false;
  contextMenu.value.chatId = null;
};

const showUserMenu = (event) => {
  event.stopPropagation();
  console.log("사용자 메뉴 열기");

  closeContextMenu();

  userMenu.value = {
    isVisible: true,
    position: {
      top: `${event.pageY - 50}px`,
      left: `${event.pageX}px`,
    },
  };
};

const closeUserMenu = () => {
  userMenu.value.isVisible = false;
};

const startEditingChat = (chatId, currentTitle) => {
  console.log("채팅 편집 시작:", chatId);

  editingChatId.value = chatId;
  editingTitle.value = currentTitle;
  closeContextMenu();

  nextTick(() => {
    const input = document.querySelector(
      `.sidebar__chat-edit-input[data-chat-id="${chatId}"]`,
    );
    if (input) {
      input.focus();
      input.select();
    }
  });
};

/**
 * saveEditingChat: 채팅 제목 저장 (API 호출)
 */
const saveEditingChat = async (chatId) => {
  const newTitle = editingTitle.value.trim();

  if (!newTitle) {
    console.warn("⚠️ 제목이 비어있습니다");
    editingChatId.value = null;
    return;
  }

  try {
    console.log("채팅 제목 저장:", chatId, newTitle);

    const updated = await updateChatRoomTitle(chatId, newTitle);

    console.log("✅ 채팅 제목 저장 성공:", updated);

    const chat = chatRooms.value.find((c) => c.id === chatId);
    if (chat) {
      chat.title = newTitle;
    }

    editingChatId.value = null;
    editingTitle.value = "";
  } catch (error) {
    console.error("❌ 채팅 제목 저장 실패:", error);
    alert("제목을 저장할 수 없습니다. 다시 시도해주세요.");
  }
};

const cancelEditingChat = () => {
  console.log("❌ 채팅 편집 취소");
  editingChatId.value = null;
  editingTitle.value = "";
};

const handleChatTitleKeydown = (event, chatId) => {
  if (event.key === "Enter") {
    saveEditingChat(chatId);
  } else if (event.key === "Escape") {
    cancelEditingChat();
  }
};

/* ==================== 윈도우 리사이즈 감지 ==================== */

const handleWindowResize = () => {
  const windowWidth = window.innerWidth;
  isMobileView.value = windowWidth < 1024;

  console.log(
    `윈도우 리사이즈: ${windowWidth}px → 모바일: ${isMobileView.value}`,
  );
};

/**
 * loadChatRooms: 채팅 목록 로드 (API 호출)
 */
const loadChatRooms = async () => {
  console.log("채팅 목록 로드 (API)");

  isLoadingChatRooms.value = true;

  try {
    const response = await getChatRoomList({
      page: 0,
      size: 100,
      status: "active",
    });

    console.log("✅ 채팅 목록 로드 성공:", response);

    chatRooms.value = response.content || [];

    console.log(`로드된 채팅: ${chatRooms.value.length}개`);
  } catch (error) {
    console.error("❌ 채팅 목록 로드 실패:", error);
    chatRooms.value = [];
  } finally {
    isLoadingChatRooms.value = false;
  }
};

const reloadPage = () => {
  console.log("페이지 새로고침 요청");
  window.location.reload();
};

/* ==================== 라이프사이클 ==================== */

onMounted(() => {
  console.log("✅ MainSidebar 마운트됨");

  loadChatRooms();
  handleWindowResize();
  initToggleSections();
  window.addEventListener("resize", handleWindowResize);

  document.addEventListener("click", () => {
    closeContextMenu();
    closeUserMenu();
  });

  console.log("✅ 이벤트 리스너 등록됨");
});

onUnmounted(() => {
  console.log("MainSidebar 언마운트됨");
  window.removeEventListener("resize", handleWindowResize);
  document.removeEventListener("click", () => {
    closeContextMenu();
    closeUserMenu();
  });
});
</script>

<style scoped lang="scss">
@use "@/assets/styles/whole_variables.scss" as *;
@use "@/assets/styles/whole_animations.scss" as *;

/* ==================== Mobile Overlay ==================== */

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  animation: fadeIn 0.3s ease;
}

/* ==================== Sidebar 전체 구조 ==================== */

.sidebar {
  display: flex;
  flex-direction: column;
  width: 250px;
  height: 100vh;
  background-color: $white;
  border-right: 1px solid $gray-200;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;

  @media (max-width: 639px) {
    width: 75vw;
    max-width: 250px;
  }

  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow-y: auto;

  &--open {
    transform: translateX(0);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: $gray-300;
    border-radius: 3px;

    &:hover {
      background: $gray-400;
    }
  }

  /* ==================== Header ==================== */

  &__header {
    padding: $spacing-5;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
  }

  /* ==================== Logo ==================== */

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--color-border-light);

    &-image {
      width: 63px;
      height: 33px;
      object-fit: contain;
      transition: all 0.3s ease;
      image-rendering: crisp-edges;
      cursor: pointer;
    }
  }

  /* ==================== New Chat Button ==================== */

  &__new-chat {
    &-button {
      cursor: pointer;
      margin: 0 $spacing-6;
      margin-top: 18px;
      padding: $spacing-3 $spacing-4;
      border: 1px solid var(--primary-color);
      border-radius: 8px;
      background-color: transparent;
      color: var(--primary-color);
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      height: 35px;
      flex-shrink: 0;

      &:hover:not(:disabled) {
        background-color: var(--primary-color);
        color: $white;
        transform: scale(1.02);
        box-shadow: 0 4px 12px var(--primary-hover-color);
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &-text {
      font-size: 14px;
    }
  }

  /* ==================== 검색창 ==================== */

  &__search {
    position: relative;
    margin: 32px 24px;
    flex-shrink: 0;

    &-input {
      width: 100%;
      padding-right: 30px;
      border: none;
      border-bottom: 2px solid #5d5d5d;
      border-radius: 0;
      background-color: transparent;
      font-size: 13px;
      color: #333;

      &::placeholder {
        color: #999;
      }

      &:focus {
        outline: none;
        border-bottom-color: var(--primary-color);
        animation: underlineExpand 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      &:not(:placeholder-shown) {
        border-bottom-color: #333;
      }
    }

    &-icon {
      position: absolute;
      right: $spacing-4;
      top: 50%;
      transform: translateY(-50%);
      color: $secondary-text;
      font-size: 16px;
      pointer-events: none;
    }
  }

  /* ==================== History (채팅 목록) ==================== */

  &__history {
    flex: 1;
    overflow-y: auto;
    padding: $spacing-4 24px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: $gray-300;
      border-radius: 3px;

      &:hover {
        background: $gray-400;
      }
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: $spacing-8;
  }

  &__loading-text {
    color: $secondary-text;
    font-size: 14px;
    text-align: center;
    margin: 0;
  }

  /* ✅ 섹션 헤더 (그룹명 + 접기/펼치기 버튼) */
  &__history-section {
    margin-bottom: $spacing-6;

    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      padding: 0 4px;
      cursor: default;
    }

    &-title {
      font-size: 12px;
      font-weight: 600;
      color: $secondary-text;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* ✅ 채팅 개수 표시 */
    &-count {
      font-size: 11px;
      font-weight: 500;
      color: $gray-400;
    }

    /* ✅ 접기/펼치기 토글 버튼 */
    &-toggle {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      color: $secondary-text;
      padding: 4px 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
      line-height: 1;

      &:hover {
        background-color: $gray-100;
        color: $primary-text;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }

  &__chat-list {
    list-style: none;
    margin: 0;
    padding: 0;
    /* ✅ 접기/펼치기 애니메이션 */
    animation: slideDown 0.3s ease-out;
  }

  /* ==================== Chat Item ==================== */

  &__chat-item {
    padding: 8px 4px;
    color: $secondary-text;
    font-size: 12px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-2;
    transition: all 0.2s ease;

    &:hover {
      background-color: $gray-50;
      color: $primary-text;
      animation: fadeInLeft 0.2s ease-out;
    }

    &--active {
      background-color: $gray-100;
      color: var(--primary-color);
      font-weight: 600;
      border-left: 3px solid var(--primary-color);
      padding-left: calc($spacing-4 - 3px);
    }
  }

  &__chat-title {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__chat-actions {
    display: none;
    gap: $spacing-2;
    flex-shrink: 0;

    .sidebar__chat-item:hover & {
      display: flex;
    }
  }

  &__chat-action-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 10px;
    padding: $spacing-1 $spacing-2;
    color: $secondary-text;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      color: $black;
      background-color: $white;
      transform: scale(1.2);
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: $spacing-8;
  }

  &__empty-text {
    color: $secondary-text;
    font-size: 14px;
    text-align: center;
    margin: 0;
  }

  /* ==================== Footer ==================== */

  &__footer {
    padding: $spacing-4;
    border-top: 1px solid $gray-100;
    display: flex;
    flex-direction: column;
    gap: $spacing-3;
    flex-shrink: 0;

    &__user-profile {
      background: none;
      border: none;
      cursor: pointer;
      padding: $spacing-2;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: $spacing-3;
      transition: all 0.2s ease;
      &:hover,
      &:focus,
      &:active {
        transform: none;
        box-shadow: none;
      }

      .user-avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
      }

      .user-info {
        padding-left: 4px;
        font-size: 13px;

        .name {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: $spacing-1;
          text-align: center;
        }

        .role {
          font-weight: 600;
          color: $gray-400;
          text-align: center;
        }
      }
    }
  }
}

.sidebar__user-role {
  font-size: 12px;
  color: $secondary-text;
}

/* ==================== 제목 편집 입력 필드 ==================== */

.sidebar__chat-edit-input {
  flex: 1;
  border: none;
  border-bottom: 2px solid var(--primary-color);
  background: none;
  color: $primary-text;
  font-size: 14px;
  padding: 2px 0;

  &:focus {
    outline: none;
    border-bottom-color: var(--primary-color);
  }

  &::placeholder {
    color: $secondary-text;
  }
}

/* ==================== Context Menu ==================== */

.sidebar__context-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: $z-popover - 10;
}

.sidebar__context-menu {
  position: fixed;
  z-index: $z-popover;
  background-color: $white;
  border: 1px solid $gray-200;
  border-radius: $border-radius-md;
  box-shadow: $shadow-lg;
  padding: $spacing-2 0;
  animation: scaleIn 0.2s ease-out;
  min-width: 160px;
}

.sidebar__context-menu-item {
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  color: $primary-text;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background-color: $gray-50;
    color: $primary-text;
  }

  &:active {
    background-color: $gray-100;
  }
}

.sidebar__context-menu-icon {
  font-size: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
}

.sidebar__context-menu-text {
  flex: 1;
  white-space: nowrap;
}

/* ==================== Custom Animations ==================== */

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ✅ 섹션 펼침 애니메이션 */
@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 1000px;
    transform: translateY(0);
  }
}
</style>
