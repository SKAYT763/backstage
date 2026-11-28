
/* =====================================
   BACKSTAGE by SKAYT
   v0.1 ALPHA
   Основная логика приложения
   ===================================== */

import { AudioCore } from "./engine/core.js";
import { NavigationEngine } from "./ui/navigation.js";
import { LiquidUI } from "./ui/liquid.js";
import { DesktopUI } from "./ui/desktop.js";

const audioCore = new AudioCore();

/* 1. Получаем HTML-элементы */

const audioInput = document.getElementById("audioInput");
const audioResults = document.getElementById("audioResults");
const fileName = document.getElementById("fileName");
const audioPlayer = document.getElementById("audioPlayer");
const audioStats = document.getElementById("audioStats");
const waveform = document.getElementById("waveform");


/* 2. Настройки приложения */

const allowedFormats = ["wav", "mp3", "flac"];

let currentAudioURL = null;
let analysisRequestId = 0;


/* 3. Очистка предыдущего файла */

function resetAudio() {
   
    analysisRequestId++;
    audioCore.clear();
    audioPlayer.pause();
    audioPlayer.removeAttribute("src");
    audioPlayer.load();

    if (currentAudioURL !== null) {
        URL.revokeObjectURL(currentAudioURL);
        currentAudioURL = null;
    }

    audioResults.hidden = true;
    audioStats.textContent = "";
    fileName.textContent = "";
}


/* 4. Форматирование длительности */

function formatDuration(seconds) {

    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);

    return `${minutes}:${String(remainder).padStart(2, "0")}`;
}


/* 5. Обработка выбранного файла */

audioInput.addEventListener("change", async function () {

    const file = audioInput.files[0];

    // Проверяем, выбран ли файл

    if (!file) {
        return;
    }

    // Получаем расширение файла

    const extension = file.name
        .split(".")
        .pop()
        .toLowerCase();

    // Проверяем допустимый формат

    if (!allowedFormats.includes(extension)) {

        alert("Поддерживаются только WAV, MP3 и FLAC.");

        audioInput.value = "";

        return;
    }

    // Очищаем предыдущий трек

    resetAudio();

    // Создаём локальную ссылку на аудиофайл

    currentAudioURL = URL.createObjectURL(file);

    // Передаём файл аудиоплееру

    audioPlayer.src = currentAudioURL;

    // Отображаем название файла

    fileName.textContent = file.name;

    // Показываем блок результатов

    audioResults.hidden = false;

    // Пока скрываем звуковую волну

    waveform.hidden = true;

    // Выводим информацию о файле

    const fileSize = (file.size / 1024 / 1024).toFixed(2);

    audioStats.textContent =
        `Формат: ${extension.toUpperCase()} | Размер: ${fileSize} МБ`;


    // Позволяем повторно выбрать тот же файл

    audioInput.value = "";

    // Запускаем Audio Core

    const requestId = analysisRequestId;

    const engineInfo = document.createElement("div");

    engineInfo.textContent =
        "Audio Engine: декодирование...";

    audioStats.appendChild(engineInfo);

    try {

        const buffer = await audioCore.load(file);

        if (
            requestId !== analysisRequestId ||
            buffer === null
        ) {
            return;
        }

        engineInfo.textContent =
            "Audio Engine: Ready";

        console.log("BACKSTAGE Audio Core", {
            fileName: file.name,
            duration: buffer.duration,
            sampleRate: buffer.sampleRate,
            channels: buffer.numberOfChannels,
            samplesPerChannel: buffer.length,
            totalSamples:
                buffer.length * buffer.numberOfChannels,
            memoryMiB:
                (
                    buffer.length *
                    buffer.numberOfChannels *
                    4 / 1024 / 1024
                ).toFixed(2)
        });

    } catch (error) {

        if (requestId !== analysisRequestId) {
            return;
        }

        engineInfo.textContent =
            "Audio Engine: ошибка декодирования";

        console.error(
            "BACKSTAGE Audio Core Error:",
            error
        );
    }
});


/* 6. Получаем длительность трека */

audioPlayer.addEventListener("loadedmetadata", function () {

    if (Number.isFinite(audioPlayer.duration)) {

        const duration = formatDuration(audioPlayer.duration);

       audioStats.insertBefore(
    document.createTextNode(
        ` | Длительность: ${duration}`
    ),
    audioStats.querySelector("div")
);
    }
});


/* 7. Обработка ошибок воспроизведения */

audioPlayer.addEventListener("error", function () {

    if (currentAudioURL !== null) {

        resetAudio();

        alert("Не удалось открыть аудиофайл. Возможно, файл повреждён или его кодек не поддерживается браузером.");
    }
});



/* 8. Анимация фирменного логотипа */

const brandSymbol = document.getElementById("brandSymbol");

const logoBars = brandSymbol.querySelectorAll(".logo-bars rect");

const originalHeights = [15, 28, 46, 68];

let logoPlaying = false;
let animationFrame = null;
let animationMix = 0;
let lastFrameTime = 0;

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);


/* Отрисовка анимации */

function animateLogo(time) {

    const deltaTime = lastFrameTime
        ? Math.min((time - lastFrameTime) / 1000, 0.05)
        : 0.016;

    lastFrameTime = time;

    const target = logoPlaying ? 1 : 0;

    animationMix += (target - animationMix)
        * (1 - Math.exp(-deltaTime * 6));


    logoBars.forEach((bar, index) => {

        const originalHeight = originalHeights[index];

        const waveHeight = 37 + 29 * Math.sin(
            time / 210 - index * 1.45
        );

        const height = reducedMotion.matches
            ? originalHeight
            : originalHeight +
              (waveHeight - originalHeight) * animationMix;

        bar.setAttribute("height", height);
        bar.setAttribute("y", 50 - height / 2);

    });


    if (logoPlaying || animationMix > 0.001) {

        animationFrame = requestAnimationFrame(animateLogo);

    } else {

        logoBars.forEach((bar, index) => {

            bar.setAttribute("height", originalHeights[index]);
            bar.setAttribute("y", 50 - originalHeights[index] / 2);

        });

        animationMix = 0;
        animationFrame = null;
        lastFrameTime = 0;

    }

}


/* Плавный запуск */

function startLogoAnimation() {

    logoPlaying = true;

    if (animationFrame === null) {

        animationFrame = requestAnimationFrame(animateLogo);

    }

}


/* Плавная остановка */

function stopLogoAnimation() {

    logoPlaying = false;

}


/* События аудиоплеера */

audioPlayer.addEventListener("playing", startLogoAnimation);

audioPlayer.addEventListener("pause", stopLogoAnimation);

audioPlayer.addEventListener("ended", stopLogoAnimation);

audioPlayer.addEventListener("waiting", stopLogoAnimation);

audioPlayer.addEventListener("emptied", stopLogoAnimation);

audioPlayer.addEventListener("error", stopLogoAnimation);


/* =====================================
   9. Навигация приложения
   ===================================== */

const navigation = new NavigationEngine();

navigation.init("audio-lab");

console.log(
    "BACKSTAGE Navigation Engine:",
    navigation.getState()
);


/* ========================================
   10. Liquid UI Engine 1.1
   ======================================== */

const liquidUI = new LiquidUI();

liquidUI.init();

console.log("BACKSTAGE Liquid UI 1.1: Ready");



/* ========================================
   11. DESKTOP STUDIO ENGINE
   ======================================== */

const desktopUI = new DesktopUI();

desktopUI.init();

console.log(
    "BACKSTAGE Desktop Studio 1.0: Ready"
);
