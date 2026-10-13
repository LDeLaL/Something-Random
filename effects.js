
/* =========================================
   SOMETHING RANDOM
   RARITY EFFECTS SYSTEM

   담당 기능:
   - 뽑기 결과 감지
   - 희귀도별 효과 실행
   - 결과창 효과 클래스 관리
   - 등급별 파티클 생성
   - 효과 종료 및 정리
   - 외부 시스템과 이벤트 연동

   실제 시각 효과는 effects.css에서 관리
   기본 style.css는 수정하지 않음
========================================= */

(() => {
    "use strict";


    // =====================================
    // 1. 기본 요소
    // =====================================

    const $ = id => document.getElementById(id);

    const elements = {
        resultWindow: $("result-window"),
        resultIcon: $("result-icon"),
        resultName: $("result-name"),
        resultRarity: $("result-rarity")
    };


    // =====================================
    // 2. 희귀도별 효과 설정
    //
    // duration: 효과 지속 시간
    // particles: 생성할 파티클 개수
    //
    // 실제 애니메이션과 색상은
    // effects.css에서 지정한다.
    // =====================================

    const EFFECT_CONFIG = {
        Common: {
            tier: "common",
            duration: 900,
            particles: 0
        },

        Uncommon: {
            tier: "uncommon",
            duration: 1200,
            particles: 4
        },

        Rare: {
            tier: "rare",
            duration: 1500,
            particles: 8
        },

        Epic: {
            tier: "epic",
            duration: 1900,
            particles: 14
        },

        Legendary: {
            tier: "legendary",
            duration: 2400,
            particles: 22
        }
    };


    // =====================================
    // 3. 상태 관리
    // =====================================

    const EFFECT_CLASSES = [
        "sr-effect-active",
        "sr-effect-empty",

        "sr-effect-common",
        "sr-effect-uncommon",
        "sr-effect-rare",
        "sr-effect-epic",
        "sr-effect-legendary"
    ];

    let cleanupTimer = null;

    let currentEffect = null;

    let effectSequence = 0;


    // =====================================
    // 4. 희귀도 확인
    // =====================================

    function getRarity(item) {
        if (!item || typeof item !== "object") {
            return null;
        }

        const rarity = item.rarity;

        if (
            typeof rarity === "string" &&
            Object.prototype.hasOwnProperty.call(
                EFFECT_CONFIG,
                rarity
            )
        ) {
            return rarity;
        }

        // 희귀도 이름을 찾을 수 없으면 일반 등급 처리
        return "Common";
    }


    // =====================================
    // 5. 이전 효과 정리
    // =====================================

    function removeVisuals() {
        if (elements.resultWindow) {
            elements.resultWindow.classList.remove(
                ...EFFECT_CLASSES
            );

            // 이전 파티클 제거
            const oldLayer = elements.resultWindow.querySelector(
                ".sr-effect-particle-layer"
            );

            if (oldLayer) {
                oldLayer.remove();
            }
        }

        if (elements.resultIcon) {
            elements.resultIcon.classList.remove(
                "sr-effect-icon"
            );
        }

        if (elements.resultName) {
            elements.resultName.classList.remove(
                "sr-effect-name"
            );
        }

        if (elements.resultRarity) {
            elements.resultRarity.classList.remove(
                "sr-effect-badge"
            );
        }
    }


    function clearEffect() {
        if (cleanupTimer !== null) {
            clearTimeout(cleanupTimer);

            cleanupTimer = null;
        }

        // 진행 중인 효과가 있으면 종료 이벤트 전달
        if (currentEffect) {
            const previousEffect = currentEffect;

            currentEffect = null;

            window.dispatchEvent(
                new CustomEvent("sr:effect-end", {
                    detail: {
                        item: previousEffect.item,
                        rarity: previousEffect.rarity,
                        tier: previousEffect.tier,
                        isEmpty: previousEffect.isEmpty,
                        interrupted: true
                    }
                })
            );
        }

        removeVisuals();
    }


    // =====================================
    // 6. 파티클 레이어 생성
    // =====================================

    function createParticleLayer(tier, count) {
        if (
            !elements.resultWindow ||
            count <= 0
        ) {
            return;
        }

        const layer = document.createElement("div");

        layer.className = "sr-effect-particle-layer";

        layer.setAttribute("aria-hidden", "true");

        // 파티클이 화면 내용을 가리지 않도록
        // 시각 효과 전용 컨테이너로 사용한다.
        for (let i = 0; i < count; i += 1) {
            const particle = document.createElement("span");

            particle.className =
                "sr-effect-particle " +
                `sr-effect-particle--${tier}`;

            // 결과창 안에서 파티클 위치를 무작위로 배치
            const x = 8 + Math.random() * 84;
            const y = 12 + Math.random() * 76;

            const size = 3 + Math.random() * 5;
            const delay = Math.random() * 0.45;

            particle.style.setProperty(
                "--particle-x",
                `${x}%`
            );

            particle.style.setProperty(
                "--particle-y",
                `${y}%`
            );

            particle.style.setProperty(
                "--particle-size",
                `${size}px`
            );

            particle.style.setProperty(
                "--particle-delay",
                `${delay}s`
            );

            layer.appendChild(particle);
        }

        elements.resultWindow.appendChild(layer);
    }


    // =====================================
    // 7. 효과 종료
    // =====================================

    function finishEffect(sequence) {
        // 이미 새로운 효과가 시작되었으면
        // 이전 타이머는 아무 작업도 하지 않는다.
        if (
            !currentEffect ||
            currentEffect.sequence !== sequence
        ) {
            return;
        }

        const finishedEffect = currentEffect;

        currentEffect = null;
        cleanupTimer = null;

        removeVisuals();

        window.dispatchEvent(
            new CustomEvent("sr:effect-end", {
                detail: {
                    item: finishedEffect.item,
                    rarity: finishedEffect.rarity,
                    tier: finishedEffect.tier,
                    isEmpty: finishedEffect.isEmpty,
                    interrupted: false
                }
            })
        );
    }


    // =====================================
    // 8. 효과 실행
    // =====================================

    function playEffect(item, isEmpty = !item) {
        clearEffect();

        // 결과창이 존재하지 않는 경우
        // 데이터 처리에는 영향을 주지 않는다.
        if (!elements.resultWindow) {
            return;
        }

        const empty = isEmpty || !item;

        const rarity = empty
            ? null
            : getRarity(item);

        const config = empty
            ? null
            : EFFECT_CONFIG[rarity];

        const tier = empty
            ? "empty"
            : config.tier;

        const duration = empty
            ? 500
            : config.duration;

        const sequence = ++effectSequence;

        currentEffect = {
            sequence,
            item: item || null,
            rarity,
            tier,
            isEmpty: empty
        };


        // ---------------------------------
        // 기본 효과 클래스 적용
        // ---------------------------------

        elements.resultWindow.classList.add(
            "sr-effect-active"
        );

        if (empty) {
            // 아무것도 나오지 않은 경우
            elements.resultWindow.classList.add(
                "sr-effect-empty"
            );

        } else {
            elements.resultWindow.classList.add(
                `sr-effect-${tier}`
            );

            if (elements.resultIcon) {
                elements.resultIcon.classList.add(
                    "sr-effect-icon"
                );
            }

            if (elements.resultName) {
                elements.resultName.classList.add(
                    "sr-effect-name"
                );
            }

            if (elements.resultRarity) {
                elements.resultRarity.classList.add(
                    "sr-effect-badge"
                );
            }

            // 등급별 파티클 생성
            createParticleLayer(
                tier,
                config.particles
            );
        }


        // ---------------------------------
        // 효과 시작 이벤트
        // ---------------------------------

        window.dispatchEvent(
            new CustomEvent("sr:effect-start", {
                detail: {
                    item: item || null,
                    rarity,
                    tier,
                    isEmpty: empty,
                    duration
                }
            })
        );


        // ---------------------------------
        // 효과 종료 타이머
        // ---------------------------------

        cleanupTimer = window.setTimeout(() => {
            finishEffect(sequence);
        }, duration);
    }


    // =====================================
    // 9. 뽑기 결과 이벤트 연결
    // =====================================

    function handleDrawResult(event) {
        const detail = event.detail || {};

        const item = detail.item || null;

        const isEmpty = detail.isEmpty === true || !item;

        playEffect(item, isEmpty);
    }


    // =====================================
    // 10. 외부 시스템 API
    // =====================================

    window.SomethingRandomEffects = {
        // 특정 아이템의 효과 실행
        play(item) {
            playEffect(item, !item);
        },

        // 꽝 효과 실행
        playEmpty() {
            playEffect(null, true);
        },

        // 진행 중인 효과 강제 종료
        clear() {
            clearEffect();
        },

        // 현재 효과 정보 확인
        getCurrentEffect() {
            if (!currentEffect) {
                return null;
            }

            return {
                item: currentEffect.item,
                rarity: currentEffect.rarity,
                tier: currentEffect.tier,
                isEmpty: currentEffect.isEmpty
            };
        },

        // 희귀도별 효과 설정 확인
        getConfig(rarity) {
            const config = EFFECT_CONFIG[rarity];

            return config
                ? { ...config }
                : null;
        }
    };


    // =====================================
    // 11. 초기화
    // =====================================

    window.addEventListener(
        "sr:draw-result",
        handleDrawResult
    );

    console.log(
        "[Something Random] 희귀도 효과 시스템이 준비되었습니다."
    );

})();
