
/* ========================================
   BACKSTAGE by SKAYT
   Audio Core 1.0
   ======================================== */

export class AudioCore {

    constructor() {
        this.context = null;
        this.audioBuffer = null;
        this.file = null;
        this.loadId = 0;
    }

    /* Создание аудиоконтекста */

    getContext() {
        if (this.context === null) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass) {
                throw new Error(
                    "Web Audio API не поддерживается"
                );
            }

            this.context = new AudioContextClass();
        }

        return this.context;
    }

    /* Загрузка и декодирование файла */

    async load(file) {

        const loadId = ++this.loadId;

        this.audioBuffer = null;
        this.file = null;

        const context = this.getContext();

        const arrayBuffer = await file.arrayBuffer();

        const audioBuffer =
            await context.decodeAudioData(arrayBuffer);

        if (loadId !== this.loadId) {
            return null;
        }

        this.audioBuffer = audioBuffer;
        this.file = file;

        return audioBuffer;
    }

    /* Получение аудиоданных */

    getBuffer() {
        return this.audioBuffer;
    }

    /* Проверка наличия аудио */

    hasAudio() {
        return this.audioBuffer !== null;
    }

    /* Очистка данных */

    clear() {
        this.loadId++;
        this.audioBuffer = null;
        this.file = null;
    }
}
