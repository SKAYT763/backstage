
/* ========================================
   BACKSTAGE by SKAYT
   Navigation Engine 1.0
   ======================================== */

export class NavigationEngine {

    /* 1. Инициализация */

    constructor(root = document) {

        this.root = root;

        this.activeModule = null;

        this.activeTabs = new Map();

        this.initialized = false;

        this.handleClick =
            this.handleClick.bind(this);
    }

    /* 2. Запуск навигации */

    init(defaultModule = "audio-lab") {

        if (this.initialized) {
            return;
        }

        this.root.addEventListener(
            "click",
            this.handleClick
        );

        this.initialized = true;

        this.openModule(defaultModule);
    }

    /* 3. Обработка нажатий */

    handleClick(event) {

        const moduleButton =
            event.target.closest(
                "[data-nav-module]"
            );

        const tabButton =
            event.target.closest(
                "[data-nav-tab]"
            );

        if (moduleButton) {

            this.openModule(
                moduleButton.dataset.navModule
            );

            return;
        }

        if (tabButton) {

            this.openTab(
                tabButton.dataset.navTab
            );
        }
    }

    /* 4. Переключение разделов */

    openModule(moduleId) {

        const panels =
            this.root.querySelectorAll(
                "[data-module-panel]"
            );

        const exists = Array.from(panels).some(
            panel =>
                panel.dataset.modulePanel === moduleId
        );

        if (!exists) {
            return false;
        }

        this.activeModule = moduleId;

        panels.forEach(panel => {

            panel.hidden =
                panel.dataset.modulePanel !== moduleId;
        });

        const buttons =
            this.root.querySelectorAll(
                "[data-nav-module]"
            );

        buttons.forEach(button => {

            const active =
                button.dataset.navModule === moduleId;

            button.classList.toggle(
                "is-active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        });

        const panel = Array.from(panels).find(
            item =>
                item.dataset.modulePanel === moduleId
        );

        const firstTab = panel.querySelector(
            "[data-nav-tab]"
        );

        if (firstTab) {

            const savedTab =
                this.activeTabs.get(moduleId);

            this.openTab(
                savedTab || firstTab.dataset.navTab
            );
        }

        return true;
    }

    /* 5. Переключение вкладок */

    openTab(tabId) {

        const modulePanel = Array.from(
            this.root.querySelectorAll(
                "[data-module-panel]"
            )
        ).find(panel =>
            panel.dataset.modulePanel ===
            this.activeModule
        );

        if (!modulePanel) {
            return false;
        }

        const panels =
            modulePanel.querySelectorAll(
                "[data-tab-panel]"
            );

        const exists = Array.from(panels).some(
            panel =>
                panel.dataset.tabPanel === tabId
        );

        if (!exists) {
            return false;
        }

        this.activeTabs.set(
            this.activeModule,
            tabId
        );

        panels.forEach(panel => {

            panel.hidden =
                panel.dataset.tabPanel !== tabId;
        });

        const buttons =
            modulePanel.querySelectorAll(
                "[data-nav-tab]"
            );

        buttons.forEach(button => {

            const active =
                button.dataset.navTab === tabId;

            button.classList.toggle(
                "is-active",
                active
            );

            button.setAttribute(
                "aria-pressed",
                String(active)
            );
        });

        return true;
    }

    /* 6. Получение текущего состояния */

    getState() {

        return {
            module: this.activeModule,
            tab: this.activeTabs.get(
                this.activeModule
            ) || null
        };
    }

    /* 7. Отключение навигации */

    destroy() {

        this.root.removeEventListener(
            "click",
            this.handleClick
        );

        this.initialized = false;
    }
}
