
/* =========================================
   SOMETHING RANDOM — RARITY SYSTEM
   총 29종의 아이템
   꽝 확률 25% 유지
   ========================================= */

(() => {
    "use strict";

    const EMPTY_CHANCE = 25;

    /* 등급 설정 */
    const RARITIES = {
        Common: {
            id: "common",
            name: "Common",
            label: "Common",
            rank: 1,
            color: "#a8a8b8",
            effect: "none",
            description: "일반적인 아이템입니다."
        },

        Uncommon: {
            id: "uncommon",
            name: "Uncommon",
            label: "Uncommon",
            rank: 2,
            color: "#65d69a",
            effect: "glow",
            description: "조금 더 특별한 아이템입니다."
        },

        Rare: {
            id: "rare",
            name: "Rare",
            label: "Rare",
            rank: 3,
            color: "#63a8ff",
            effect: "sparkle",
            description: "희귀한 아이템입니다."
        },

        Epic: {
            id: "epic",
            name: "Epic",
            label: "Epic",
            rank: 4,
            color: "#bd83ff",
            effect: "burst",
            description: "매우 희귀한 아이템입니다."
        },

        Legendary: {
            id: "legendary",
            name: "Legendary",
            label: "Legendary",
            rank: 5,
            color: "#ffd36b",
            effect: "legendary",
            description: "아주 특별한 아이템입니다."
        }
    };


    /* =========================================
       아이템 목록
       기존 9종 + 신규 20종 = 총 29종
       weight는 등장 가중치입니다.
       ========================================= */

    const ITEMS = [

        /* -------------------------------------
           기존 아이템 9종
           ------------------------------------- */

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
            description: "어디서든 볼 수 있는 나무입니다.",
            rarity: "Common",
            weight: 20
        },
        {
            id: "stone",
            name: "돌",
            icon: "🪨",
            description: "단단한 돌멩이입니다.",
            rarity: "Common",
            weight: 18
        },
        {
            id: "apple",
            name: "사과",
            icon: "🍎",
            description: "먹음직스러운 사과입니다.",
            rarity: "Uncommon",
            weight: 12
        },
        {
            id: "coal",
            name: "석탄",
            icon: "⚫",
            description: "연료로 사용할 수 있는 석탄입니다.",
            rarity: "Uncommon",
            weight: 9
        },
        {
            id: "metal",
            name: "금속",
            icon: "🔩",
            description: "다양하게 활용할 수 있는 금속입니다.",
            rarity: "Uncommon",
            weight: 7
        },
        {
            id: "iron_ore",
            name: "철광석",
            icon: "⛏️",
            description: "철을 얻을 수 있는 광석입니다.",
            rarity: "Rare",
            weight: 5
        },
        {
            id: "amethyst",
            name: "보라색 수정",
            icon: "💎",
            description: "아름다운 보랏빛을 띠는 수정입니다.",
            rarity: "Epic",
            weight: 3
        },
        {
            id: "gold_nugget",
            name: "금 조각",
            icon: "🪙",
            description: "반짝이는 귀중한 금 조각입니다.",
            rarity: "Legendary",
            weight: 1
        },


        /* -------------------------------------
           신규 Common 아이템 6종
           ------------------------------------- */

        {
            id: "dirt",
            name: "흙",
            icon: "🟫",
            description: "땅을 이루는 흔한 물질입니다.",
            rarity: "Common",
            weight: 4
        },
        {
            id: "sand",
            name: "모래",
            icon: "🏖️",
            description: "작은 알갱이로 이루어진 모래입니다.",
            rarity: "Common",
            weight: 4
        },
        {
            id: "clay",
            name: "점토",
            icon: "🧱",
            description: "물기를 머금으면 빚기 쉬운 흙입니다.",
            rarity: "Common",
            weight: 3
        },
        {
            id: "water",
            name: "물",
            icon: "💧",
            description: "생명과 자연에 필수적인 물질입니다.",
            rarity: "Common",
            weight: 3
        },
        {
            id: "paper",
            name: "종이",
            icon: "📄",
            description: "글을 쓰거나 물건을 포장할 때 사용합니다.",
            rarity: "Common",
            weight: 2
        },
        {
            id: "granite",
            name: "화강암",
            icon: "🪨",
            description: "여러 광물로 이루어진 단단한 암석입니다.",
            rarity: "Common",
            weight: 2
        },


        /* -------------------------------------
           신규 Uncommon 아이템 9종
           ------------------------------------- */

        {
            id: "glass",
            name: "유리",
            icon: "🪟",
            description: "투명하고 단단하지만 깨지기 쉬운 물질입니다.",
            rarity: "Uncommon",
            weight: 3
        },
        {
            id: "plastic",
            name: "플라스틱",
            icon: "♻️",
            description: "다양한 형태로 가공할 수 있는 재료입니다.",
            rarity: "Uncommon",
            weight: 2
        },
        {
            id: "rubber",
            name: "고무",
            icon: "🛞",
            description: "탄성이 뛰어난 재료입니다.",
            rarity: "Uncommon",
            weight: 2
        },
        {
            id: "fabric",
            name: "천",
            icon: "🧵",
            description: "실을 엮어 만든 천입니다.",
            rarity: "Uncommon",
            weight: 2
        },
        {
            id: "leather",
            name: "가죽",
            icon: "🟤",
            description: "튼튼하고 유연한 가죽 재료입니다.",
            rarity: "Uncommon",
            weight: 2
        },
        {
            id: "copper_ore",
            name: "구리 광석",
            icon: "🟠",
            description: "구리를 얻을 수 있는 광석입니다.",
            rarity: "Uncommon",
            weight: 3
        },
        {
            id: "aluminum",
            name: "알루미늄",
            icon: "🥫",
            description: "가볍고 다양한 곳에 쓰이는 금속입니다.",
            rarity: "Uncommon",
            weight: 3
        },
        {
            id: "marble",
            name: "대리석",
            icon: "◻️",
            description: "건축과 조각에 널리 쓰이는 암석입니다.",
            rarity: "Uncommon",
            weight: 1
        },
        {
            id: "quartz",
            name: "석영",
            icon: "🔹",
            description: "자연에서 흔히 발견되는 광물입니다.",
            rarity: "Uncommon",
            weight: 2
        },


        /* -------------------------------------
           신규 Rare 아이템 3종
           ------------------------------------- */

        {
            id: "silver_ore",
            name: "은 광석",
            icon: "🥈",
            description: "은을 얻을 수 있는 광석입니다.",
            rarity: "Rare",
            weight: 2
        },
        {
            id: "sulfur",
            name: "황",
            icon: "🟡",
            description: "노란색을 띠는 원소 물질입니다.",
            rarity: "Rare",
            weight: 2
        },
        {
            id: "obsidian",
            name: "흑요석",
            icon: "⚫",
            description: "용암이 빠르게 식어 만들어진 화산암입니다.",
            rarity: "Rare",
            weight: 2
        },


        /* -------------------------------------
           신규 Epic 아이템 1종
           ------------------------------------- */

        {
            id: "emerald",
            name: "에메랄드",
            icon: "💚",
            description: "선명한 녹색으로 유명한 보석입니다.",
            rarity: "Epic",
            weight: 2
        },


        /* -------------------------------------
           신규 Legendary 아이템 1종
           ------------------------------------- */

        {
            id: "diamond",
            name: "다이아몬드",
            icon: "💎",
            description: "매우 단단하며 아름답게 빛나는 보석입니다.",
            rarity: "Legendary",
            weight: 1
        }

    ];


    /* =========================================
       뽑기 시스템
       ========================================= */

    function getTotalWeight() {
        return ITEMS.reduce((total, item) => {
            return total + item.weight;
        }, 0);
    }

    function draw() {
        // 꽝 확률 25%
        if (Math.random() * 100 < EMPTY_CHANCE) {
            return null;
        }

        const totalWeight = getTotalWeight();
        let roll = Math.random() * totalWeight;

        for (const item of ITEMS) {
            roll -= item.weight;

            if (roll < 0) {
                return item;
            }
        }

        // 부동소수점 연산 등의 예외에 대한 안전장치
        return ITEMS[ITEMS.length - 1] || null;
    }


    /* =========================================
       조회 기능
       ========================================= */

    function getItems() {
        return ITEMS;
    }

    function getRarity(value) {
        const rarityName =
            typeof value === "string"
                ? value
                : value?.rarity;

        if (!rarityName) {
            return null;
        }

        if (RARITIES[rarityName]) {
            return RARITIES[rarityName];
        }

        return Object.values(RARITIES).find(rarity => {
            return rarity.id === rarityName;
        }) || null;
    }

    function getItemsByRarity(rarityName) {
        const rarity = getRarity(rarityName);

        if (!rarity) {
            return [];
        }

        return ITEMS.filter(item => {
            return item.rarity === rarity.name;
        });
    }

    function getItemProbability(itemOrId) {
        const item = typeof itemOrId === "string"
            ? ITEMS.find(candidate => candidate.id === itemOrId)
            : itemOrId;

        if (!item || !ITEMS.some(candidate => candidate.id === item.id)) {
            return 0;
        }

        // 꽝 확률까지 포함한 전체 뽑기 1회 기준 확률(%)
        const probability =
            (item.weight / getTotalWeight()) *
            (1 - EMPTY_CHANCE / 100) *
            100;

        return Number(probability.toFixed(4));
    }

    function getRarityStats() {
        const totalWeight = getTotalWeight();
        const stats = {};

        for (const [key, rarity] of Object.entries(RARITIES)) {
            const rarityItems = ITEMS.filter(item => {
                return item.rarity === key;
            });

            const rarityWeight = rarityItems.reduce((total, item) => {
                return total + item.weight;
            }, 0);

            stats[key] = {
                ...rarity,
                count: rarityItems.length,
                totalWeight: rarityWeight,
                probability: totalWeight > 0
                    ? Number((
                        (rarityWeight / totalWeight) *
                        (1 - EMPTY_CHANCE / 100) *
                        100
                    ).toFixed(4))
                    : 0
            };
        }

        return stats;
    }


    /* =========================================
       다른 파일에서 사용할 수 있도록 연결
       ========================================= */

    window.SR_ITEMS = ITEMS;
    window.SR_DRAW = draw;
    window.SR_RARITIES = RARITIES;
    window.SR_EMPTY_CHANCE = EMPTY_CHANCE;

    window.SomethingRandomRarity = {
        draw,
        getItems,
        getRarity,
        getRarityStats,
        getItemsByRarity,
        getItemProbability,
        getEmptyChance() {
            return EMPTY_CHANCE;
        },
        getTotalWeight
    };

})();
