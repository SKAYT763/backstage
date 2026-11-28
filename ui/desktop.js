
/* ========================================
   BACKSTAGE by SKAYT
   Desktop Studio Engine 1.0
   ======================================== */

import { SpringPhysics } from "./spring.js";


export class DesktopUI {

    /* ====================================
       1. CONSTRUCTOR
       ==================================== */

    constructor() {

        this.shell = null;
        this.nav = null;
        this.toggle = null;

        this.indicator = null;
        this.surface = null;

        this.spring = null;
        this.observer = null;

        this.initialized = false;
        this.collapsed = false;

        this.pointerId = null;

        this.desktop = window.matchMedia(
            "(min-width: 769px)"
        );

        this.reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        this.storageKey =
            "backstageDesktopCollapsed";


        /* Bind Methods */

        const methods = [

            "update",

            "toggleSidebar",

            "handleLayoutChange",

            "handlePointerDown",

            "handlePointerEnd",

            "handleMotionPreference"

        ];

        methods.forEach(method => {

            this[method] =
                this[method].bind(this);

        });

    }


    /* ====================================
       2. INITIALIZATION
       ==================================== */

    init() {

        if (this.initialized) return;

        this.shell =
            document.querySelector(".app-shell");

        this.nav =
            document.querySelector(".workspace-nav");

        this.toggle =
            document.getElementById("sidebarToggle");


        if (
            !this.shell ||
            !this.nav ||
            !this.toggle
        ) {

            console.warn(
                "Desktop Studio: elements not found"
            );

            return;

        }


        /* Create Desktop Capsule */

        this.indicator =
            document.createElement("div");

        this.indicator.className =
            "desktop-indicator";

        this.indicator.setAttribute(
            "aria-hidden",
            "true"
        );


        this.surface =
            document.createElement("div");

        this.surface.className =
            "desktop-surface";


        this.indicator.appendChild(
            this.surface
        );

        this.nav.prepend(
            this.indicator
        );


        /* Connect Spring Physics */

        this.spring = new SpringPhysics((x, y) => {

            this.surface.style.transform =
                `scale(${x}, ${y})`;

        });


        /* Restore Saved Preference */

        try {

            this.collapsed =
                localStorage.getItem(
                    this.storageKey
                ) === "true";

        } catch (error) {

            this.collapsed = false;

        }


        /* Observe Navigation State */

        this.observer =
            new MutationObserver(this.update);

        this.observer.observe(this.nav, {

            subtree: true,

            attributes: true,

            attributeFilter: [
                "aria-pressed"
            ]

        });


        /* Event Listeners */

        this.toggle.addEventListener(
            "click",
            this.toggleSidebar
        );

        this.nav.addEventListener(
            "pointerdown",
            this.handlePointerDown
        );

        window.addEventListener(
            "pointerup",
            this.handlePointerEnd
        );

        window.addEventListener(
            "pointercancel",
            this.handlePointerEnd
        );

        window.addEventListener(
            "blur",
            this.handlePointerEnd
        );

        window.addEventListener(
            "resize",
            this.update
        );

        this.desktop.addEventListener(
            "change",
            this.handleLayoutChange
        );

        this.reducedMotion.addEventListener(
            "change",
            this.handleMotionPreference
        );


        this.initialized = true;

        this.applySidebarState();

        this.update();

    }


    /* ====================================
       3. SIDEBAR STATE
       ==================================== */

    applySidebarState() {

        this.shell.classList.toggle(

            "sidebar-collapsed",

            this.desktop.matches &&
            this.collapsed

        );


        this.toggle.setAttribute(

            "aria-expanded",

            String(!this.collapsed)

        );


        const label = this.collapsed

            ? "Развернуть панель"

            : "Свернуть панель";


        this.toggle.setAttribute(
            "aria-label",
            label
        );

        this.toggle.title = label;

    }


    /* ====================================
       4. TOGGLE SIDEBAR
       ==================================== */

    toggleSidebar() {

        if (!this.desktop.matches) return;

        this.collapsed = !this.collapsed;

        this.applySidebarState();


        try {

            localStorage.setItem(

                this.storageKey,

                String(this.collapsed)

            );

        } catch (error) {

            /* Storage may be unavailable */

        }

    }


    /* ====================================
       5. UPDATE CAPSULE POSITION
       ==================================== */

    update() {

        if (!this.initialized) return;


        if (!this.desktop.matches) {

            this.nav.classList.remove(
                "desktop-ready"
            );

            return;

        }


        const activeButton =
            this.nav.querySelector(
                ".nav-button.is-active"
            );


        if (!activeButton) {

            this.nav.classList.remove(
                "desktop-ready"
            );

            return;

        }


        this.indicator.style.transform =

            `translate3d(0, ${activeButton.offsetTop}px, 0)`;


        /* Avoid Initial Animation */

        if (
            !this.nav.classList.contains(
                "desktop-ready"
            )
        ) {

            this.indicator.getBoundingClientRect();

            this.nav.classList.add(
                "desktop-ready"
            );

        }

    }


    /* ====================================
       6. POINTER DOWN
       ==================================== */

    handlePointerDown(event) {

        if (
            !this.desktop.matches ||

            this.reducedMotion.matches ||

            !event.isPrimary ||

            event.button !== 0 ||

            this.pointerId !== null
        ) return;


        const button =
            event.target.closest(".nav-button");

        if (!button) return;


        this.pointerId = event.pointerId;


        this.spring.setTarget(

            0.82,

            0.82,

            550,

            44

        );

    }


    /* ====================================
       7. POINTER RELEASE
       ==================================== */

    handlePointerEnd(event) {

        if (this.pointerId === null) return;

        if (
            event.type !== "blur" &&
            event.pointerId !== this.pointerId
        ) return;


        this.pointerId = null;


        if (this.reducedMotion.matches) {

            this.spring.reset();

            return;

        }


        this.spring.setTarget(

            1,

            1,

            170,

            21

        );

    }


    /* ====================================
       8. RESPONSIVE LAYOUT
       ==================================== */

    handleLayoutChange() {

        this.pointerId = null;

        this.spring.reset();

        this.nav.classList.remove(
            "desktop-ready"
        );

        this.applySidebarState();

        this.update();

    }


    /* ====================================
       9. MOTION PREFERENCES
       ==================================== */

    handleMotionPreference() {

        this.pointerId = null;

        this.spring.reset();

    }


    /* ====================================
       10. CLEANUP
       ==================================== */

    destroy() {

        if (!this.initialized) return;

        this.observer?.disconnect();

        this.spring?.destroy();


        this.toggle.removeEventListener(
            "click",
            this.toggleSidebar
        );

        this.nav.removeEventListener(
            "pointerdown",
            this.handlePointerDown
        );

        window.removeEventListener(
            "pointerup",
            this.handlePointerEnd
        );

        window.removeEventListener(
            "pointercancel",
            this.handlePointerEnd
        );

        window.removeEventListener(
            "blur",
            this.handlePointerEnd
        );

        window.removeEventListener(
            "resize",
            this.update
        );

        this.desktop.removeEventListener(
            "change",
            this.handleLayoutChange
        );

        this.reducedMotion.removeEventListener(
            "change",
            this.handleMotionPreference
        );


        this.nav.classList.remove(
            "desktop-ready"
        );

        this.shell.classList.remove(
            "sidebar-collapsed"
        );

        this.indicator.remove();

        this.pointerId = null;

        this.initialized = false;

    }

}
