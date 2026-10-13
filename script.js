
/* =========================================
   SOMETHING RANDOM
   기본 뽑기 및 인벤토리 시스템

   담당 기능:
   - 랜덤 뽑기
   - 아이템 획득 및 수량 관리
   - 인벤토리 표시
   - 보유 데이터 저장
   - 도감 및 효과 시스템과 연동

   다른 파일의 디자인은 수정하지 않음.
========================================= */

(() => {
    "use strict";

    // =====================================
    // 1. 기본 설정
    // =====================================

    const STORAGE_KEY = "somethingRandomInventoryV1";

    const $ = id => document.getElementById(id);

    const elements = {
        drawButton: $("draw-button"),
        resultIcon: $("result-icon"),
        resultName: $("result-name"),
        resultMessage: $("result-message"),
        resultRarity: $("result-rarity"),

        inventoryGrid: $("inventory-grid"),
        inventoryEmpty: $("inventory-empty"),
        inventoryUniqueCount: $("inventory-unique-count"),
        inventoryTotalCount: $("inventory-total-count")
    };

    // 사이트 이름 설정
    document.title = "Something Random";

    const logo = document.querySelector(".logo");

    if (logo) {
        logo.textContent = "SOMETHING RANDOM";
    }


    // =====================================
    // 2. 기본 아이템 목록
    //
    // rarity.js가 SR_ITEMS를 제공하면
    // 해당 목록을 우선 사용한다.
    // =====================================

    const DEFAULT_ITEMS = [
        {
            id: "potato",
            name: "감자",
            icon: "🥔",
            description: "평범한 감자입니다.",
            rarity: "Common",
            weight: 30
        },
        {
            id: "wood",
            name: "나무",
            icon: "🪵",
            description: "어디에나 쓸 수 있는 나무입니다.",
            rarity: "Common",
            weight: 25
        },
        {
            id: "stone",
            name: "돌",
            icon: "🪨",
            description: "단단한 돌입니다.",
            rarity: "Common",
            weight: 20
        },
        {
            id: "metal",
            name: "금속",
            icon: "🔩",
            description: "쓸모가 많아 보이는 금속입니다.",
            rarity: "Uncommon",
            weight: 12
        },
        {
            id: "apple",
            name: "사과",
            icon: "🍎",
            description: "빨갛고 먹음직스러운 사과입니다.",
            rarity: "Uncommon",
            weight: 8
        },
        {
            id: "crystal",
            name: "보라색 수정",
            icon: "💎",
            description: "신비로운 빛을 내는 수정입니다.",
            rarity: "Rare",
            weight: 5
        }
    ];

    function getItemList() {
        if (
            Array.isArray(window.SR_ITEMS) &&
            window.SR_ITEMS.length > 0
        ) {
            return window.SR_ITEMS;
        }

        return DEFAULT_ITEMS;
    }


    // =====================================
    // 3. 인벤토리 데이터
    // =====================================

    let inventory = loadInventory();

    let isDrawing = false;

    function loadInventory() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return {};
            }

            const parsed = JSON.parse(saved);

            if (
                !parsed ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {
                return {};
            }

            const result = {};

            for (const [id, amount] of Object.entries(parsed)) {
                if (
                    typeof id === "string" &&
                    Number.isSafeInteger(amount) &&
                    amount > 0
                ) {
                    result[id] = amount;
                }
            }

            return result;

        } catch (error) {
            console.error(
                "[Something Random] 인벤토리를 불러오지 못했습니다.",
                error
            );

            return {};
        }
    }

    function saveInventory() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(inventory)
            );

        } catch (error) {
            console.error(
                "[Something Random] 인벤토리를 저장하지 못했습니다.",
                error
            );
        }
    }


    // =====================================
    // 4. 아이템 뽑기
    // =====================================

    function drawItem() {
        // rarity.js의 추첨 함수가 있으면 사용한다.
        if (typeof window.SR_DRAW === "function") {
            return window.SR_DRAW();
        }

        // 기본 추첨 방식
        // 가중치 합계 100 중 25는 꽝이다.
        const items = getItemList();

        const totalWeight = items.reduce((sum, item) => {
            const weight = Number(item.weight);

            return sum + (
                Number.isFinite(weight) && weight > 0
                    ? weight
                    : 0
            );
        }, 0);

        const emptyWeight = 25;
        const random = Math.random() * (totalWeight + emptyWeight);

        if (random >= totalWeight) {
            return null;
        }

        let currentWeight = 0;

        for (const item of items) {
            const weight = Number(item.weight);

            if (!Number.isFinite(weight) || weight <= 0) {
                continue;
            }

            currentWeight += weight;

            if (random < currentWeight) {
                return item;
            }
        }

        return null;
    }


    // =====================================
    // 5. 결과 표시
    // =====================================

    function showResult(item) {
        if (!item) {
            elements.resultIcon.textContent = "∅";

            elements.resultName.textContent = "아무것도 없음";

            elements.resultMessage.textContent =
                "이번에는 아무것도 얻지 못했습니다.";

            elements.resultRarity.textContent = "꽝";

            elements.resultRarity.className =
                "rarity-badge rarity-none";

            return;
        }

        elements.resultIcon.textContent = item.icon || "📦";

        elements.resultName.textContent =
            item.name || "이름 없는 아이템";

        elements.resultMessage.textContent =
            item.description || "새로운 아이템을 발견했습니다.";

        const rarity = item.rarity || "Common";

        elements.resultRarity.textContent = rarity;

        elements.resultRarity.className =
            "rarity-badge rarity-" +
            String(rarity)
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, "-");

        // 희귀도 효과 시스템에 결과 전달
        window.dispatchEvent(
            new CustomEvent("sr:draw-result", {
                detail: {
                    item,
                    isEmpty: false
                }
            })
        );
    }

    function showEmptyResult() {
        showResult(null);

        // 꽝 결과도 효과 시스템에서 처리할 수 있도록 전달
        window.dispatchEvent(
            new CustomEvent("sr:draw-result", {
                detail: {
                    item: null,
                    isEmpty: true
                }
            })
        );
    }


    // =====================================
    // 6. 아이템 획득
    // =====================================

    function acquireItem(item) {
        if (
            !item ||
            typeof item.id !== "string" ||
            item.id.length === 0
        ) {
            console.error(
                "[Something Random] 올바르지 않은 아이템입니다.",
                item
            );

            return;
        }

        const itemId = item.id;

        // 같은 아이템은 수량만 증가
        if (
            !Number.isSafeInteger(inventory[itemId]) ||
            inventory[itemId] < 0
        ) {
            inventory[itemId] = 0;
        }

        if (inventory[itemId] >= Number.MAX_SAFE_INTEGER) {
            console.warn("아이템 수량이 최대값에 도달했습니다.");

            return;
        }

        inventory[itemId] += 1;

        saveInventory();

        renderInventory();

        // 처음 발견한 아이템을 도감 시스템에 전달
        window.dispatchEvent(
            new CustomEvent("sr:item-discovered", {
                detail: { item }
            })
        );

        // 아이템 획득 이벤트
        window.dispatchEvent(
            new CustomEvent("sr:item-acquired", {
                detail: {
                    item,
                    quantity: inventory[itemId]
                }
            })
        );
    }


    // =====================================
    // 7. 인벤토리 표시
    // =====================================

    function renderInventory() {
        const items = getItemList();

        elements.inventoryGrid.replaceChildren();

        let uniqueCount = 0;
        let totalCount = 0;

        const ownedItems = items.filter(item => {
            return (
                Number.isSafeInteger(inventory[item.id]) &&
                inventory[item.id] > 0
            );
        });

        for (const item of ownedItems) {
            const quantity = inventory[item.id];

            uniqueCount += 1;
            totalCount += quantity;

            const card = document.createElement("div");

            card.className = "inventory-item";

            card.dataset.itemId = item.id;

            const icon = document.createElement("div");

            icon.className = "inventory-item-icon";
            icon.textContent = item.icon || "📦";
            icon.setAttribute("aria-hidden", "true");

            const name = document.createElement("div");

            name.className = "inventory-item-name";
            name.textContent = item.name || "이름 없는 아이템";

            const count = document.createElement("div");

            count.className = "inventory-item-count";
            count.textContent = `× ${quantity}`;

            const rarity = document.createElement("div");

            rarity.className = "inventory-item-rarity";
            rarity.textContent = item.rarity || "Common";

            card.append(
                icon,
                name,
                count,
                rarity
            );

            elements.inventoryGrid.appendChild(card);
        }

        // 인벤토리 통계
        elements.inventoryUniqueCount.textContent =
            uniqueCount.toLocaleString("ko-KR");

        elements.inventoryTotalCount.textContent =
            totalCount.toLocaleString("ko-KR");

        // 비어 있는 상태 표시
        const isEmpty = ownedItems.length === 0;

        elements.inventoryEmpty.hidden = !isEmpty;

        // 다른 시스템에서도 인벤토리 상태를 확인할 수 있도록 전달
        window.dispatchEvent(
            new CustomEvent("sr:inventory-updated", {
                detail: {
                    inventory: { ...inventory },
                    uniqueCount,
                    totalCount
                }
            })
        );
    }


    // =====================================
    // 8. 뽑기 버튼
    // =====================================

    function handleDraw() {
        if (isDrawing) {
            return;
        }

        isDrawing = true;

        elements.drawButton.disabled = true;

        try {
            const item = drawItem();

            if (item === null || item === undefined) {
                showEmptyResult();

            } else {
                showResult(item);
                acquireItem(item);
            }

        } catch (error) {
            console.error(
                "[Something Random] 뽑기 중 오류가 발생했습니다.",
                error
            );

            elements.resultMessage.textContent =
                "뽑기에 실패했습니다. 개발자 콘솔을 확인해 주세요.";

        } finally {
            isDrawing = false;
            elements.drawButton.disabled = false;
        }
    }


    // =====================================
    // 9. 시스템 초기화
    // =====================================

    function init() {
        if (
            !elements.drawButton ||
            !elements.inventoryGrid ||
            !elements.inventoryEmpty
        ) {
            console.error(
                "[Something Random] 필요한 HTML 요소를 찾지 못했습니다."
            );

            return;
        }

        elements.drawButton.addEventListener(
            "click",
            handleDraw
        );

        renderInventory();

        console.log(
            "[Something Random] 기본 시스템이 준비되었습니다."
        );
    }


    // =====================================
    // 10. 다른 JS 파일에서 사용할 API
    // =====================================

    window.SomethingRandom = {
        getInventory() {
            return { ...inventory };
        },

        getItemList() {
            return [...getItemList()];
        },

        getQuantity(itemId) {
            return inventory[itemId] || 0;
        },

        renderInventory,

        saveInventory
    };


    // DOM 준비 후 실행
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
