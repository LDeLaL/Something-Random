
/* =========================================
   SOMETHING RANDOM
   RARITY SYSTEM

   담당 기능:
   - 아이템 목록 관리
   - 희귀도 등급 관리
   - 등장 확률 계산
   - 뽑기 결과 결정
   - 희귀도별 정보 제공

   script.js / codex.js / effects.js 연동
========================================= */

(() => {
    "use strict";


    // =====================================
    // 1. 기본 설정
    // =====================================

    const EMPTY_CHANCE = 25;

    // 아이템이 나오지 않을 확률: 25%
    // 나머지 75%에서 아이템을 추첨한다.


    // =====================================
    // 2. 희귀도 등급
    // =====================================

    const RARITIES = {
        Common: {
            id: "Common",
            name: "Common",
            label: "일반",
            rank: 1,
            color: "#B8B1C4",
            effect: "none",
            description: "흔하게 발견할 수 있는 아이템입니다."
        },

        Uncommon: {
            id: "Uncommon",
            name: "Uncommon",
            label: "고급",
            rank: 2,
            color: "#8FD5A5",
            effect: "none",
            description: "조금 더 특별한 아이템입니다."
        },

        Rare: {
            id: "Rare",
            name: "Rare",
            label: "희귀",
            rank: 3,
            color: "#83BCFF",
            effect: "rare",
            description: "발견하기 어려운 아이템입니다."
        },

        Epic: {
            id: "Epic",
            name: "Epic",
            label: "에픽",
            rank: 4,
            color: "#C5A3FF",
            effect: "epic",
            description: "상당히 드문 아이템입니다."
        },

        Legendary: {
            id: "Legendary",
            name: "Legendary",
            label: "전설",
            rank: 5,
            color: "#FFD58A",
            effect: "legendary",
            description: "매우 낮은 확률로 발견되는 아이템입니다."
        }
    };


    // =====================================
    // 3. 아이템 목록
    //
    // weight:
    // 아이템이 등장하는 상대적인 가중치.
    //
    // 전체 가중치 합계는 100이다.
    // 꽝 확률은 별도로 25% 적용한다.
    //
    // 기존 아이템 ID는 변경하지 않는 것이 좋다.
    // =====================================

    const ITEMS = [
        {
            id: "potato",
            name: "감자",
            icon: "🥔",
            description: "평범한 감자입니다.",
            rarity: "Common",
            weight: 25
        },

        {
            id: "wood",
            name: "나무",
            icon: "🪵",
            description: "어디에나 쓸 수 있는 나무입니다.",
            rarity: "Common",
            weight: 20
        },

        {
            id: "stone",
            name: "돌",
            icon: "🪨",
            description: "단단하고 흔한 돌입니다.",
            rarity: "Common",
            weight: 18
        },

        {
            id: "apple",
            name: "사과",
            icon: "🍎",
            description: "먹음직스러운 빨간 사과입니다.",
            rarity: "Uncommon",
            weight: 12
        },

        {
            id: "coal",
            name: "석탄",
            icon: "⚫",
            description: "검고 단단한 석탄입니다.",
            rarity: "Uncommon",
            weight: 9
        },

        {
            id: "metal",
            name: "금속",
            icon: "🔩",
            description: "쓸모가 많아 보이는 금속입니다.",
            rarity: "Uncommon",
            weight: 7
        },

        {
            id: "iron_ore",
            name: "철광석",
            icon: "⛏️",
            description: "철을 얻을 수 있을 것 같은 광석입니다.",
            rarity: "Rare",
            weight: 5
        },

        {
            id: "amethyst",
            name: "보라색 수정",
            icon: "💎",
            description: "희미한 빛을 내는 신비로운 수정입니다.",
            rarity: "Epic",
            weight: 3
        },

        {
            id: "gold_nugget",
            name: "금 조각",
            icon: "🪙",
            description: "반짝이는 귀한 금 조각입니다.",
            rarity: "Legendary",
            weight: 1
        }
    ];


    // =====================================
    // 4. 아이템 데이터 검사
    // =====================================

    function validateItems(items) {
        if (!Array.isArray(items)) {
            throw new TypeError(
                "[Something Random] 아이템 목록은 배열이어야 합니다."
            );
        }

        const ids = new Set();

        for (const item of items) {
            if (
                !item ||
                typeof item.id !== "string" ||
                item.id.length === 0
            ) {
                throw new Error(
                    "[Something Random] 아이템 ID가 올바르지 않습니다."
                );
            }

            if (ids.has(item.id)) {
                throw new Error(
                    `[Something Random] 중복된 아이템 ID: ${item.id}`
                );
            }

            ids.add(item.id);

            if (!Object.prototype.hasOwnProperty.call(
                RARITIES,
                item.rarity
            )) {
                throw new Error(
                    `[Something Random] 존재하지 않는 희귀도: ${item.rarity}`
                );
            }

            if (
                !Number.isFinite(item.weight) ||
                item.weight < 0
            ) {
                throw new Error(
                    `[Something Random] 잘못된 가중치: ${item.id}`
                );
            }
        }

        return true;
    }

    validateItems(ITEMS);


    // =====================================
    // 5. 전체 가중치 계산
    // =====================================

    function getTotalWeight(items = ITEMS) {
        return items.reduce((total, item) => {
            return total + item.weight;
        }, 0);
    }


    // =====================================
    // 6. 실제 뽑기
    //
    // 반환값:
    // - 아이템 객체: 획득 성공
    // - null: 아무것도 나오지 않음
    // =====================================

    function draw() {
        // 먼저 꽝 여부를 결정한다.
        if (Math.random() * 100 < EMPTY_CHANCE) {
            return null;
        }

        const items = ITEMS.filter(item => {
            return item.weight > 0;
        });

        const totalWeight = getTotalWeight(items);

        if (totalWeight <= 0) {
            return null;
        }

        // 가중치에 따른 아이템 추첨
        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= item.weight;

            if (random < 0) {
                return item;
            }
        }

        // 부동소수점 오차에 대한 안전장치
        return items[items.length - 1] || null;
    }


    // =====================================
    // 7. 희귀도별 확률 계산
    //
    // itemPoolChance:
    // 아이템이 나왔을 때의 희귀도 비율
    //
    // overallChance:
    // 꽝 확률까지 포함한 전체 뽑기 확률
    // =====================================

    function getRarityStats() {
        const totalWeight = getTotalWeight();

        const stats = {};

        for (const rarity of Object.keys(RARITIES)) {
            const rarityItems = ITEMS.filter(item => {
                return (
                    item.rarity === rarity &&
                    item.weight > 0
                );
            });

            const rarityWeight = rarityItems.reduce(
                (total, item) => total + item.weight,
                0
            );

            const itemPoolChance = totalWeight > 0
                ? (rarityWeight / totalWeight) * 100
                : 0;

            const overallChance =
                ((100 - EMPTY_CHANCE) / 100) * itemPoolChance;

            stats[rarity] = {
                ...RARITIES[rarity],
                itemCount: rarityItems.length,
                weight: rarityWeight,
                itemPoolChance,
                overallChance
            };
        }

        return stats;
    }


    // =====================================
    // 8. 개별 아이템 확률 계산
    // =====================================

    function getItemProbability(itemId) {
        const item = ITEMS.find(entry => {
            return entry.id === itemId;
        });

        if (!item) {
            return 0;
        }

        const totalWeight = getTotalWeight();

        if (totalWeight <= 0) {
            return 0;
        }

        return (
            ((100 - EMPTY_CHANCE) / 100) *
            (item.weight / totalWeight) *
            100
        );
    }


    // =====================================
    // 9. 희귀도 정보 가져오기
    // =====================================

    function getRarity(rarityId) {
        const rarity = RARITIES[rarityId];

        if (!rarity) {
            return null;
        }

        return { ...rarity };
    }


    // =====================================
    // 10. 희귀도별 아이템 목록
    // =====================================

    function getItemsByRarity(rarityId) {
        return ITEMS
            .filter(item => item.rarity === rarityId)
            .map(item => ({ ...item }));
    }


    // =====================================
    // 11. 외부 시스템 연결
    // =====================================

    // script.js에서 사용하는 아이템 목록
    window.SR_ITEMS = ITEMS;

    // script.js에서 사용하는 추첨 함수
    window.SR_DRAW = draw;

    // effects.js 및 기타 시스템에서 사용하는 정보
    window.SR_RARITIES = RARITIES;

    // 꽝 확률
    window.SR_EMPTY_CHANCE = EMPTY_CHANCE;

    // 추가 API
    window.SomethingRandomRarity = {
        draw,

        getItems() {
            return ITEMS.map(item => ({ ...item }));
        },

        getRarity,

        getRarityStats,

        getItemsByRarity,

        getItemProbability,

        getEmptyChance() {
            return EMPTY_CHANCE;
        },

        getTotalWeight() {
            return getTotalWeight();
        }
    };


    // =====================================
    // 12. 초기화 로그
    // =====================================

    console.log(
        "[Something Random] 희귀도 시스템이 준비되었습니다."
    );

    console.log(
        `[Something Random] 등록된 아이템: ${ITEMS.length}종`
    );

    console.log(
        `[Something Random] 꽝 확률: ${EMPTY_CHANCE}%`
    );

})();
