
/* =========================================
   SOMETHING RANDOM — ACHIEVEMENTS
   업적 시스템
   기존 뽑기 / 도감 / 효과 시스템과 분리
   ========================================= */

(() => {
    "use strict";

    const STORAGE_KEY = "somethingRandomAchievementsV1";

    const ACHIEVEMENTS = [
        {
            id: "first_draw",
            name: "첫걸음",
            description: "처음으로 뽑기를 진행하세요.",
            icon: "🎲",
            condition: data => data.totalDraws >= 1
        },
        {
            id: "first_empty",
            name: "빈손",
            description: "처음으로 꽝을 뽑으세요.",
            icon: "🫥",
            condition: data => data.emptyDraws >= 1
        },
        {
            id: "first_item",
            name: "수집의 시작",
            description: "처음으로 아이템을 획득하세요.",
            icon: "📦",
            condition: data => data.totalItems >= 1
        },
        {
            id: "draw_10",
            name: "단골 손님",
            description: "총 10회 뽑기를 진행하세요.",
            icon: "🎯",
            condition: data => data.totalDraws >= 10
        },
        {
            id: "draw_100",
            name: "멈출 수 없어",
            description: "총 100회 뽑기를 진행하세요.",
            icon: "🔥",
            condition: data => data.totalDraws >= 100
        },
        {
            id: "potato_10",
            name: "감자 농장",
            description: "감자를 10개 보유하세요.",
            icon: "🥔",
            condition: data => (data.inventory.potato || 0) >= 10
        },
        {
            id: "wood_20",
            name: "목재 수집가",
            description: "나무를 20개 보유하세요.",
            icon: "🪵",
            condition: data => (data.inventory.wood || 0) >= 20
        },
        {
            id: "rare_first",
            name: "반짝이는 발견",
            description: "Rare 등급 이상의 아이템을 획득하세요.",
            icon: "✨",
            condition: data => data.hasRare
        },
        {
            id: "amethyst_first",
            name: "보라색의 유혹",
            description: "보라색 수정을 획득하세요.",
            icon: "💜",
            condition: data => data.hasAmethyst
        },
        {
            id: "codex_first",
            name: "새로운 발견",
            description: "아이템을 도감에 처음 등록하세요.",
            icon: "📖",
            condition: data => data.discoveredIds.length >= 1
        },
        {
            id: "collect_5",
            name: "소소한 수집가",
            description: "서로 다른 아이템 5종을 발견하세요.",
            icon: "🧺",
            condition: data => data.discoveredIds.length >= 5
        },
        {
            id: "collect_9",
            name: "수집의 달인",
            description: "서로 다른 아이템 9종을 발견하세요.",
            icon: "👑",
            condition: data => data.discoveredIds.length >= 9
        }
    ];

    function createDefaultState() {
        return {
            unlocked: [],
            totalDraws: 0,
            emptyDraws: 0,
            totalItems: 0,
            inventory: {},
            discoveredIds: [],
            hasRare: false,
            hasAmethyst: false
        };
    }

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return createDefaultState();
            }

            const parsed = JSON.parse(saved);
            const defaults = createDefaultState();

            return {
                ...defaults,
                ...parsed,
                unlocked: Array.isArray(parsed.unlocked)
                    ? parsed.unlocked
                    : [],
                inventory: parsed.inventory &&
                    typeof parsed.inventory === "object"
                    ? parsed.inventory
                    : {},
                discoveredIds: Array.isArray(parsed.discoveredIds)
                    ? parsed.discoveredIds
                    : []
            };
        } catch (error) {
            console.error(
                "[Something Random] 업적 데이터를 불러오지 못했습니다.",
                error
            );

            return createDefaultState();
        }
    }

    let state = loadState();

    const $ = id => document.getElementById(id);

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error(
                "[Something Random] 업적 데이터를 저장하지 못했습니다.",
                error
            );
        }
    }

    function getItemId(item) {
        return item && item.id != null
            ? String(item.id)
            : null;
    }

    function getItemRarity(item) {
        return String(item?.rarity || "").toLowerCase();
    }

    function syncInventory(inventory) {
        if (!inventory || typeof inventory !== "object") {
            return;
        }

        const normalized = {};

        for (const [id, value] of Object.entries(inventory)) {
            const quantity = typeof value === "number"
                ? value
                : Number(value?.quantity ?? value?.count ?? 0);

            normalized[id] = Number.isFinite(quantity)
                ? Math.max(0, quantity)
                : 0;
        }

        state.inventory = normalized;
        saveState();
        checkAchievements();
    }

    function syncDiscoveredItems() {
        const codex = window.SomethingRandomCodex;

        if (!codex ||
            typeof codex.getDiscoveredItems !== "function") {
            return;
        }

        try {
            const items = codex.getDiscoveredItems();

            if (Array.isArray(items)) {
                const ids = items
                    .map(item => {
                        if (typeof item === "string" ||
                            typeof item === "number") {
                            return String(item);
                        }

                        return getItemId(item);
                    })
                    .filter(Boolean);

                state.discoveredIds = [
                    ...new Set([
                        ...state.discoveredIds,
                        ...ids
                    ])
                ];
            }
        } catch (error) {
            console.warn(
                "[Something Random] 도감 정보를 동기화하지 못했습니다.",
                error
            );
        }
    }

    function renderAchievements() {
        const grid = $("achievements-grid");
        const empty = $("achievements-empty");
        const progressCount = $("achievements-progress-count");
        const progressBar = $("achievements-progress-bar");
        const progressFill = $("achievements-progress-fill");

        if (!grid) return;

        const unlockedSet = new Set(state.unlocked);
        const unlockedCount = ACHIEVEMENTS.filter(
            achievement => unlockedSet.has(achievement.id)
        ).length;

        if (progressCount) {
            progressCount.textContent =
                `${unlockedCount} / ${ACHIEVEMENTS.length}`;
        }

        if (progressBar) {
            progressBar.setAttribute(
                "aria-valuemax",
                String(ACHIEVEMENTS.length)
            );

            progressBar.setAttribute(
                "aria-valuenow",
                String(unlockedCount)
            );
        }

        if (progressFill) {
            progressFill.style.width =
                `${(unlockedCount / ACHIEVEMENTS.length) * 100}%`;
        }

        grid.innerHTML = "";

        for (const achievement of ACHIEVEMENTS) {
            const unlocked = unlockedSet.has(achievement.id);

            const card = document.createElement("article");
            card.className = "achievement-card";

            if (unlocked) {
                card.classList.add("is-unlocked");
            } else {
                card.classList.add("is-locked");
            }

            const icon = document.createElement("div");
            icon.className = "achievement-icon";
            icon.textContent = unlocked ? achievement.icon : "🔒";

            const info = document.createElement("div");
            info.className = "achievement-info";

            const name = document.createElement("h3");
            name.className = "achievement-name";
            name.textContent = achievement.name;

            const description = document.createElement("p");
            description.className = "achievement-description";
            description.textContent = achievement.description;

            const status = document.createElement("span");
            status.className = "achievement-status";
            status.textContent = unlocked ? "달성 완료" : "미달성";

            info.append(name, description, status);
            card.append(icon, info);
            grid.appendChild(card);
        }

        if (empty) {
            empty.hidden = ACHIEVEMENTS.length !== 0;
        }
    }

    function showToast(achievement) {
        const container = $("achievement-toast-container");

        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "achievement-toast";

        const icon = document.createElement("div");
        icon.className = "achievement-toast-icon";
        icon.textContent = achievement.icon;

        const content = document.createElement("div");
        content.className = "achievement-toast-content";

        const label = document.createElement("span");
        label.className = "achievement-toast-label";
        label.textContent = "업적 달성!";

        const name = document.createElement("strong");
        name.className = "achievement-toast-name";
        name.textContent = achievement.name;

        const description = document.createElement("span");
        description.className = "achievement-toast-description";
        description.textContent = achievement.description;

        content.append(label, name, description);
        toast.append(icon, content);
        container.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add("is-visible");
        });

        window.setTimeout(() => {
            toast.classList.remove("is-visible");

            window.setTimeout(() => {
                toast.remove();
            }, 350);
        }, 3500);
    }

    function unlockAchievement(achievement) {
        if (state.unlocked.includes(achievement.id)) {
            return;
        }

        state.unlocked.push(achievement.id);
        saveState();
        renderAchievements();
        showToast(achievement);
    }

    function checkAchievements() {
        for (const achievement of ACHIEVEMENTS) {
            if (state.unlocked.includes(achievement.id)) {
                continue;
            }

            let achieved = false;

            try {
                achieved = Boolean(achievement.condition(state));
            } catch (error) {
                console.error(
                    `[Something Random] 업적 확인 실패: ${achievement.id}`,
                    error
                );
            }

            if (achieved) {
                unlockAchievement(achievement);
            }
        }

        renderAchievements();
    }

    function recordDrawResult(detail) {
        state.totalDraws += 1;

        if (detail?.isEmpty || !detail?.item) {
            state.emptyDraws += 1;
        }

        saveState();
        checkAchievements();
    }

    function recordItemAcquired(detail) {
        const item = detail?.item;

        if (!item) return;

        state.totalItems += 1;

        const itemId = getItemId(item);

        if (itemId) {
            const current = Number(state.inventory[itemId] || 0);

            // script.js가 이미 인벤토리를 갱신했으므로,
            // 이벤트의 quantity가 있으면 그 값을 우선 사용합니다.
            const eventQuantity = Number(detail.quantity);

            if (Number.isFinite(eventQuantity) && eventQuantity >= 0) {
                state.inventory[itemId] = eventQuantity;
            } else {
                state.inventory[itemId] = current + 1;
            }
        }

        const rarity = getItemRarity(item);

        if (["rare", "epic", "legendary"].includes(rarity)) {
            state.hasRare = true;
        }

        if (
            itemId === "amethyst" ||
            itemId === "crystal" ||
            String(item.name || "").includes("보라색 수정")
        ) {
            state.hasAmethyst = true;
        }

        saveState();
        checkAchievements();
    }

    function recordFirstDiscovery(detail) {
        const item = detail?.item;
        const itemId = getItemId(item);

        if (itemId && !state.discoveredIds.includes(itemId)) {
            state.discoveredIds.push(itemId);
        }

        saveState();
        checkAchievements();
    }

    function openAchievements() {
        const overlay = $("achievements-overlay");

        if (!overlay) return;

        overlay.hidden = false;
        document.body.classList.add("achievements-open");
        renderAchievements();

        const closeButton = $("achievements-close-button");

        if (closeButton) {
            closeButton.focus();
        }
    }

    function closeAchievements() {
        const overlay = $("achievements-overlay");

        if (!overlay) return;

        overlay.hidden = true;
        document.body.classList.remove("achievements-open");

        const openButton = $("achievements-open-button");

        if (openButton) {
            openButton.focus();
        }
    }

    function bindEvents() {
        const openButton = $("achievements-open-button");
        const closeButton = $("achievements-close-button");
        const overlay = $("achievements-overlay");
        const panel = $("achievements-panel");

        openButton?.addEventListener("click", openAchievements);
        closeButton?.addEventListener("click", closeAchievements);

        overlay?.addEventListener("click", event => {
            if (event.target === overlay) {
                closeAchievements();
            }
        });

        panel?.addEventListener("click", event => {
            event.stopPropagation();
        });

        document.addEventListener("keydown", event => {
            if (
                event.key === "Escape" &&
                overlay &&
                !overlay.hidden
            ) {
                closeAchievements();
            }
        });

        window.addEventListener("sr:draw-result", event => {
            recordDrawResult(event.detail);
        });

        window.addEventListener("sr:item-acquired", event => {
            recordItemAcquired(event.detail);
        });

        window.addEventListener("sr:codex-first-discovery", event => {
            recordFirstDiscovery(event.detail);
        });

        window.addEventListener("sr:inventory-updated", event => {
            const inventory = event.detail?.inventory;

            if (inventory) {
                syncInventory(inventory);
            }
        });

        // 도감 첫 발견 이벤트가 발생하기 전의 발견도 반영합니다.
        window.addEventListener("sr:item-discovered", event => {
            const itemId = getItemId(event.detail?.item);

            if (itemId && !state.discoveredIds.includes(itemId)) {
                state.discoveredIds.push(itemId);
                saveState();
                checkAchievements();
            }
        });
    }

    function init() {
        bindEvents();
        syncDiscoveredItems();

        // 기존 인벤토리가 있다면 수집 업적에 반영합니다.
        const app = window.SomethingRandom;

        if (app && typeof app.getInventory === "function") {
            try {
                syncInventory(app.getInventory());
            } catch (error) {
                console.warn(
                    "[Something Random] 인벤토리를 불러오지 못했습니다.",
                    error
                );
            }
        }

        checkAchievements();
        renderAchievements();
    }

    window.SomethingRandomAchievements = {
        getAchievements() {
            return ACHIEVEMENTS.map(achievement => ({
                ...achievement,
                unlocked: state.unlocked.includes(achievement.id)
            }));
        },

        getUnlockedIds() {
            return [...state.unlocked];
        },

        getUnlockedCount() {
            return state.unlocked.length;
        },

        getTotalCount() {
            return ACHIEVEMENTS.length;
        },

        getState() {
            return JSON.parse(JSON.stringify(state));
        },

        render: renderAchievements,
        check: checkAchievements,
        open: openAchievements,
        close: closeAchievements
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
