
/* =====================================
   BACKSTAGE — Frequency Reveal
   Intro Animation Engine
   ===================================== */

(function () {

    /* 1. Проверяем настройки пользователя */

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    if (reducedMotion.matches) return;


    /* 2. Показываем заставку один раз за сеанс */

    try {

        if (sessionStorage.getItem("backstageIntroPlayed")) {
            return;
        }

    } catch (error) {

        console.warn("Session storage unavailable");

    }


    /* 3. Создаём заставку */

    const intro = document.createElement("div");

    intro.id = "backstageIntro";

    intro.setAttribute("aria-hidden", "true");

    intro.innerHTML = `

        <div class="intro-glow"></div>

        <svg class="intro-visual"
             viewBox="0 0 340 120">

            <g id="introSpectrum"></g>

            <g id="introLogo"
               transform="translate(120 10)"
               opacity="0">

                <g id="introBars" fill="#A78BFA">

                    <rect x="10" y="42.5"
                          width="6" height="15" rx="3"/>

                    <rect x="20" y="36"
                          width="6" height="28" rx="3"/>

                    <rect x="30" y="27"
                          width="6" height="46" rx="3"/>

                    <rect x="40" y="16"
                          width="6" height="68" rx="3"/>

                </g>

                <path id="introLetter"
                      fill="#F5F5F5"
                      opacity="0"
                      d="M50 16 H65
                         C88 16 95 39 79 47
                         C99 60 90 84 67 84
                         H50 V70 H66
                         C80 70 80 55 66 55
                         H50 V40 H64
                         C76 40 76 29 64 29
                         H50 Z"/>

            </g>

        </svg>

        <div class="intro-wordmark">
            BACKSTAGE<span>.</span>
        </div>

        <div class="intro-author">
            BY SKAYT
        </div>

        <div class="intro-line"></div>

        <div class="intro-tagline">
            Создано артистом.<br>
            <span>Для артистов.</span>
        </div>

        <div class="intro-version">
            V.0.1 ALPHA
        </div>

    `;


    /* 4. Получаем элементы заставки */

    const spectrum = intro.querySelector("#introSpectrum");

    const logo = intro.querySelector("#introLogo");

    const bars = intro.querySelectorAll("#introBars rect");

    const letter = intro.querySelector("#introLetter");

    const wordmark = intro.querySelector(".intro-wordmark");

    const author = intro.querySelector(".intro-author");

    const line = intro.querySelector(".intro-line");

    const tagline = intro.querySelector(".intro-tagline");

    const glow = intro.querySelector(".intro-glow");


    /* 5. Создаём частотный спектр */

    const spectrumBars = [];

    const spectrumCount = 48;

    const svgNamespace = "http://www.w3.org/2000/svg";

    for (let i = 0; i < spectrumCount; i++) {

        const bar = document.createElementNS(
            svgNamespace,
            "rect"
        );

        bar.setAttribute("x", 4 + i * 7);
        bar.setAttribute("y", 60);
        bar.setAttribute("width", 3);
        bar.setAttribute("height", 0);
        bar.setAttribute("rx", 1.5);
        bar.setAttribute("fill", "#A78BFA");

        spectrum.appendChild(bar);

        spectrumBars.push(bar);

    }


    /* 6. Настройки анимации */

    const originalHeights = [15, 28, 46, 68];

    const duration = 2.8;

    let startTime = null;

    let animationFrame = null;

    let fallbackTimer = null;

    let finished = false;


    /* 7. Функция плавности */

    function smooth(value) {

        value = Math.max(0, Math.min(1, value));

        return value * value * (3 - 2 * value);

    }


    /* 8. Завершение заставки */

    function finishIntro() {

        if (finished) return;

        finished = true;

        cancelAnimationFrame(animationFrame);

        clearTimeout(fallbackTimer);

        intro.remove();

        try {

            sessionStorage.setItem(
                "backstageIntroPlayed",
                "true"
            );

        } catch (error) {

            console.warn("Session storage unavailable");

        }

    }


    /* 9. Основной цикл анимации */

    function animate(time) {

        if (finished) return;

        if (reducedMotion.matches) {

            finishIntro();

            return;

        }

        if (startTime === null) {

            startTime = time;

        }

        const seconds = (time - startTime) / 1000;


        /* Схлопывание частотного спектра */

        const collapse = smooth(
            (seconds - 0.55) / 0.65
        );


        /* Раскрытие основного интерфейса */

        const reveal = smooth(
            (seconds - 2.15) / 0.65
        );


        /* Анимируем частотный спектр */

        spectrumBars.forEach((bar, index) => {

            const originalX = 4 + index * 7;

            const height = (

                8 + 68 * Math.abs(

                    Math.sin(index * 0.39 + seconds * 11)

                    * Math.cos(index * 0.13 - seconds * 3)

                )

            ) * smooth(seconds / 0.25) * (1 - collapse);


            const x = originalX
                + (145 - originalX) * collapse;


            bar.setAttribute("x", x);

            bar.setAttribute("height", height);

            bar.setAttribute("y", 60 - height / 2);

            bar.style.opacity = 1 - collapse;

        });


        /* Появление логотипа */

        logo.setAttribute(
            "opacity",
            smooth((seconds - 0.5) / 0.45)
        );


        /* Волна фирменного эквалайзера */

        bars.forEach((bar, index) => {

            const originalHeight = originalHeights[index];

            const waveHeight = 37 + 29 * Math.sin(
                seconds * 12 - index * 1.45
            );

            const mix = 1 - smooth(
                (seconds - 0.9) / 0.5
            );

            const height = originalHeight
                + (waveHeight - originalHeight) * mix;

            bar.setAttribute("height", height);

            bar.setAttribute("y", 50 - height / 2);

        });


        /* Появление буквы B */

        letter.setAttribute(
            "opacity",
            smooth((seconds - 0.8) / 0.4)
        );


        /* Появление названия */

        wordmark.style.opacity = smooth(
            (seconds - 1) / 0.4
        );

        const wordReveal = smooth(
            (seconds - 1) / 0.5
        );

        wordmark.style.clipPath =
            `inset(0 ${100 * (1 - wordReveal)}% 0 0)`;


        /* Авторская подпись */

        author.style.opacity = smooth(
            (seconds - 1.15) / 0.4
        );


        /* Световая линия */

        line.style.transform = `scaleX(${

            smooth((seconds - 1.25) / 0.45)

        })`;


        /* Слоган */

        tagline.style.opacity = smooth(
            (seconds - 1.4) / 0.4
        );


        /* Фоновое свечение */

        glow.style.opacity = smooth(
            seconds / 0.8
        ) * (1 - reveal);


        /* Кинематографичное раскрытие */

        intro.style.clipPath =
            `inset(${reveal * 50}% 0 ${reveal * 50}% 0)`;


        /* Продолжаем или завершаем анимацию */

        if (seconds < duration) {

            animationFrame = requestAnimationFrame(animate);

        } else {

            finishIntro();

        }

    }


    /* 10. Запускаем заставку */

    document.body.prepend(intro);

    fallbackTimer = setTimeout(finishIntro, 4000);

    animationFrame = requestAnimationFrame(animate);

})();
