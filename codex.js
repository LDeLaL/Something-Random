
/* =========================================
   SOMETHING RANDOM
   CODEX SYSTEM

   담당 기능:
   - 아이템 발견 기록
   - 도감 목록 표시
   - 발견 개수 계산
   - 발견 기록 저장
   - 도감 열기 및 닫기

   기본 인벤토리와 별도로 작동
========================================= */

(() => {
    "use strict";

    // =====================================
    // 1. 설정
    // =====================================

    const STORAGE_KEY = "somethingRandomCodexV1";

    const $ = id => document.getElementById(id);

    const elements = {
        overlay: $("codex-overlay"),
        panel: $("codex-panel"),

        openButton: $("codex-open-button"),
        closeButton: $("codex-close-button"),

        grid: $("codex-grid"),
        empty: $("codex-empty"),

        discoveredCount: $("codex-discovered-count"),
        totalCount: $("codex-total-count")
    };

    // 발견한 아이템 ID 목록
    let discoveredItems = loadDiscoveredItems();

    let previousFocus = null;


    // =====================================
    // 2. 데이터 불러오기
    // =====================================

    function loadDiscoveredItems() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return [];
            }

            const parsed = JSON.parse(saved);

            if (!Array.isArray(parsed)) {
                return [];
            }

            return [
                ...new Set(
                    parsed.filter(
                        id => typeof id === "string" && id.length > 0
                    )
                )
            ];

        } catch (error) {
            console.error(
                "[Something Random] 도감 기록을 불러오지 못했습니다.",
                error
            );

            return [];
        }
    }


    // =====================================
    // 3. 데이터 저장
    // =====================================

    function saveDiscoveredItems() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(discoveredItems)
            );

            return true;

        } catch (error) {
            console.error(
                "[Something Random] 도감 기록을 저장하지 못했습니다.",
                error
            );

            return false;
        }
    }


    // =====================================
    // 4. 아이템 목록 가져오기
    // =====================================

    function getItemList() {
        if (
            window.SomethingRandom &&
            typeof window.SomethingRandom.getItemList === "function"
        ) {
            try {
                const items = window.SomethingRandom.getItemList();

                if (Array.isArray(items)) {
                    return items;
                }
            } catch (error) {
                console.error(
                    "[Something Random] 아이템 목록을 가져오지 못했습니다.",
                    error
                );
            }
        }

        // script.js 초기화 전이거나 API가 없을 때의 대체 목록
        if (
            Array.isArray(window.SR_ITEMS) &&
            window.SR_ITEMS.length > 0
        ) {
            return window.SR_ITEMS;
        }

        return [];
    }


    // =====================================
    // 5. 발견 여부 확인
    // =====================================

    function hasDiscovered(itemId) {
        return discoveredItems.includes(itemId);
    }


    // =====================================
    // 6. 아이템 등록
    // =====================================

    function discoverItem(item) {
        if (
            !item ||
            typeof item.id !== "string" ||
            item.id.length === 0
        ) {
            return false;
        }

        // 이미 발견한 아이템이면 다시 등록하지 않음
        if (hasDiscovered(item.id)) {
            return false;
        }

        discoveredItems.push(item.id);

        saveDiscoveredItems();

        renderCodex();

        // 첫 발견 이벤트
        window.dispatchEvent(
            new CustomEvent("sr:codex-first-discovery", {
                detail: {
                    item,
                    discoveredCount: discoveredItems.length
                }
            })
        );

        return true;
    }


    // =====================================
    // 7. 도감 아이템 카드 생성
    // =====================================

    function createCodexCard(item) {
        const discovered = hasDiscovered(item.id);

        const card = document.createElement("div");

        card.className = discovered
            ? "codex-item codex-item-discovered"
            : "codex-item codex-item-locked";

        card.dataset.itemId = item.id;

        // 아이콘
        const icon = document.createElement("div");

        icon.className = "codex-item-icon";

        icon.textContent = discovered
            ? (item.icon || "📦")
            : "?";

        icon.setAttribute("aria-hidden", "true");


        // 이름
        const name = document.createElement("div");

        name.className = "codex-item-name";

        name.textContent = discovered
            ? (item.name || "이름 없는 아이템")
            : "미발견";


        // 설명
        const description = document.createElement("div");

        description.className = "codex-item-description";

        description.textContent = discovered
            ? (item.description || "발견한 아이템입니다.")
            : "아직 발견하지 못한 아이템입니다.";


        // 희귀도
        const rarity = document.createElement("div");

        rarity.className = "codex-item-rarity";

        rarity.textContent = discovered
            ? (item.rarity || "Common")
            : "???";


        card.append(
            icon,
            name,
            description,
            rarity
        );

        return card;
    }


    // =====================================
    // 8. 도감 렌더링
    // =====================================

    function renderCodex() {
        if (!elements.grid) {
            return;
        }

        const items = getItemList();

        // 아이템 ID 중복 방지
        const uniqueItems = [];
        const seenIds = new Set();

        for (const item of items) {
            if (
                !item ||
                typeof item.id !== "string" ||
                seenIds.has(item.id)
            ) {
                continue;
            }

            seenIds.add(item.id);
            uniqueItems.push(item);
        }

        elements.grid.replaceChildren();

        let discoveredCount = 0;

        for (const item of uniqueItems) {
            if (hasDiscovered(item.id)) {
                discoveredCount += 1;
            }

            elements.grid.appendChild(
                createCodexCard(item)
            );
        }

        // 전체 발견 개수
        if (elements.discoveredCount) {
            elements.discoveredCount.textContent =
                discoveredCount.toLocaleString("ko-KR");
        }

        // 현재 아이템 목록의 전체 개수
        if (elements.totalCount) {
            elements.totalCount.textContent =
                uniqueItems.length.toLocaleString("ko-KR");
        }

        // 목록이 비었을 때 안내
        if (elements.empty) {
            elements.empty.hidden = uniqueItems.length > 0;
        }

        // 도감 진행 상황 이벤트
        window.dispatchEvent(
            new CustomEvent("sr:codex-updated", {
                detail: {
                    discoveredCount,
                    totalCount: uniqueItems.length,
                    discoveredItems: [...discoveredItems]
                }
            })
        );
    }


    // =====================================
    // 9. 도감 열기
    // =====================================

    function openCodex() {
        if (!elements.overlay) {
            return;
        }

        previousFocus = document.activeElement;

        renderCodex();

        elements.overlay.hidden = false;

        document.body.classList.add("codex-open");

        if (elements.closeButton) {
            elements.closeButton.focus();
        }
    }


    // =====================================
    // 10. 도감 닫기
    // =====================================

    function closeCodex() {
        if (!elements.overlay) {
            return;
        }

        elements.overlay.hidden = true;

        document.body.classList.remove("codex-open");

        if (
            previousFocus &&
            typeof previousFocus.focus === "function"
        ) {
            previousFocus.focus();
        }
    }


    // =====================================
    // 11. 이벤트 연결
    // =====================================

    function bindEvents() {
        // 도감 열기 버튼
        if (elements.openButton) {
            elements.openButton.addEventListener(
                "click",
                openCodex
            );
        }

        // 도감 닫기 버튼
        if (elements.closeButton) {
            elements.closeButton.addEventListener(
                "click",
                closeCodex
            );
        }

        // 도감 바깥 영역을 누르면 닫기
        if (elements.overlay) {
            elements.overlay.addEventListener(
                "click",
                event => {
                    if (event.target === elements.overlay) {
                        closeCodex();
                    }
                }
            );
        }

        // ESC 키로 닫기
        document.addEventListener(
            "keydown",
            event => {
                if (
                    event.key === "Escape" &&
                    elements.overlay &&
                    !elements.overlay.hidden
                ) {
                    closeCodex();
                }
            }
        );

        // 아이템을 처음 발견했을 때 등록
        window.addEventListener(
            "sr:item-discovered",
            event => {
                discoverItem(event.detail?.item);
            }
        );

        // 인벤토리가 갱신되면 도감도 갱신
        window.addEventListener(
            "sr:inventory-updated",
            () => {
                renderCodex();
            }
        );
    }


    // =====================================
    // 12. 외부 시스템 연동 API
    // =====================================

    window.SomethingRandomCodex = {
        discoverItem,

        hasDiscovered,

        getDiscoveredItems() {
            return [...discoveredItems];
        },

        getDiscoveredCount() {
            return discoveredItems.length;
        },

        renderCodex,

        openCodex,

        closeCodex,

        saveDiscoveredItems
    };


    // =====================================
    // 13. 초기화
    // =====================================

    function init() {
        bindEvents();

        renderCodex();

        console.log(
            "[Something Random] 도감 시스템이 준비되었습니다."
        );
    }


    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

})();
