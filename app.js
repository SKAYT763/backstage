
/* =====================================
   BACKSTAGE by SKAYT
   v0.1 ALPHA
   Основная логика приложения
   ===================================== */


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


/* 3. Очистка предыдущего файла */

function resetAudio() {

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

audioInput.addEventListener("change", function () {

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
});


/* 6. Получаем длительность трека */

audioPlayer.addEventListener("loadedmetadata", function () {

    if (Number.isFinite(audioPlayer.duration)) {

        const duration = formatDuration(audioPlayer.duration);

        audioStats.textContent += ` | Длительность: ${duration}`;
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


function startLogoAnimation() {

    brandSymbol.classList.add("is-playing");

}


function stopLogoAnimation() {

    brandSymbol.classList.remove("is-playing");

}


/* Музыка воспроизводится */

audioPlayer.addEventListener("playing", startLogoAnimation);


/* Музыка на паузе */

audioPlayer.addEventListener("pause", stopLogoAnimation);


/* Трек закончился */

audioPlayer.addEventListener("ended", stopLogoAnimation);


/* Ожидание аудиоданных */

audioPlayer.addEventListener("waiting", stopLogoAnimation);


/* Файл сброшен или возникла ошибка */

audioPlayer.addEventListener("emptied", stopLogoAnimation);
audioPlayer.addEventListener("error", stopLogoAnimation);
