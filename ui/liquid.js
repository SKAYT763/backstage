
/* ========================================
   BACKSTAGE by SKAYT
   Liquid UI Engine 1.1
   Purple Liquid — Gesture Edition
   ======================================== */

export class LiquidUI {

    /* ====================================
       1. CONSTRUCTOR
       ==================================== */

    constructor() {

        this.nav = null;

        this.indicator = null;

        this.observer = null;

        this.resizeObserver = null;

        this.initialized = false;


        /* Responsive Mode */

        this.mobile = window.matchMedia(
            "(max-width: 768px)"
        );


        /* Gesture State */

        this.pointerId = null;

        this.startX = 0;

        this.originX = 0;

        this.currentX = 0;

        this.pressedButton = null;

        this.dragging = false;

        this.dragThreshold = 6;


       /* Gesture Animation Frame */
       
       this.dragFrame = null;
       
       this.pendingPointerX = null;


        /* Click Protection */

        this.suppressClick = false;

        this.suppressTimer = null;


        /* Bind Methods */

        this.update =
            this.update.bind(this);

        this.handleLayoutChange =
            this.handleLayoutChange.bind(this);

        this.handlePointerDown =
            this.handlePointerDown.bind(this);

        this.handlePointerMove =
            this.handlePointerMove.bind(this);

        this.handlePointerUp =
            this.handlePointerUp.bind(this);

        this.handlePointerCancel =
            this.handlePointerCancel.bind(this);

        this.handleClick =
            this.handleClick.bind(this);

    }


    /* ====================================
       2. INITIALIZATION
       ==================================== */

    init() {

        if (this.initialized) return;


        this.nav = document.querySelector(
            ".workspace-nav"
        );


        if (!this.nav) return;


        /* Create Indicator */

        this.indicator =
            document.createElement("div");

        this.indicator.className =
            "liquid-indicator";

        this.indicator.setAttribute(
            "aria-hidden",
            "true"
        );


        /* Create Glass Surface */

        const surface =
            document.createElement("div");

        surface.className =
            "liquid-surface";


        this.indicator.appendChild(surface);

        this.nav.prepend(this.indicator);


        this.initialized = true;


        /* Observe Navigation State */

        this.observer = new MutationObserver(
            this.update
        );


        this.observer.observe(this.nav, {

            subtree: true,

            attributes: true,

            attributeFilter: ["aria-pressed"]

        });


        /* Observe Layout */

        if ("ResizeObserver" in window) {

            this.resizeObserver =
                new ResizeObserver(this.update);

            this.resizeObserver.observe(
                this.nav
            );

            this.getButtons().forEach(button => {

                this.resizeObserver.observe(
                    button
                );

            });

        }


        /* Register Pointer Events */

        this.nav.addEventListener(

            "pointerdown",

            this.handlePointerDown

        );


        this.nav.addEventListener(

            "pointermove",

            this.handlePointerMove

        );


        this.nav.addEventListener(

            "pointerup",

            this.handlePointerUp

        );


        this.nav.addEventListener(

            "pointercancel",

            this.handlePointerCancel

        );


        this.nav.addEventListener(

            "lostpointercapture",

            this.handlePointerCancel

        );


        this.nav.addEventListener(

            "click",

            this.handleClick,

            true

        );


        /* Register Layout Events */

        window.addEventListener(

            "resize",

            this.handleLayoutChange

        );


        this.mobile.addEventListener(

            "change",

            this.handleLayoutChange

        );


        /* Initial Position */

        this.update();

    }


    /* ====================================
       3. NAVIGATION HELPERS
       ==================================== */

    getButtons() {

        return Array.from(

            this.nav.querySelectorAll(
                ".nav-button"
            )

        );

    }


    getActiveButton() {

        return this.nav.querySelector(
            ".nav-button.is-active"
        );

    }


    /* ====================================
       4. CAPSULE POSITION
       ==================================== */

    setPosition(x, y) {

        this.currentX = x;

        this.indicator.style.transform =
            `translate3d(${x}px, ${y}px, 0)`;

    }


    getVisualPosition() {

        const indicatorRect =
            this.indicator.getBoundingClientRect();

        const navRect =
            this.nav.getBoundingClientRect();


        return (

            indicatorRect.left

            - navRect.left

            - this.nav.clientLeft

        );

    }


    /* ====================================
       5. SYNCHRONIZE WITH NAVIGATION
       ==================================== */

    update() {

        if (!this.initialized) return;


        /* Desktop Mode */

        if (!this.mobile.matches) {

            this.resetGesture();

            this.nav.classList.remove(
                "liquid-ready"
            );

            return;

        }


        /* Do Not Interrupt Active Gesture */

        if (this.pointerId !== null) return;


        const button = this.getActiveButton();

        if (!button) return;


        const width = button.offsetWidth;

        const height = button.offsetHeight;


        if (!width || !height) return;


        /* Update Capsule Geometry */

        this.indicator.style.width =
            `${width}px`;

        this.indicator.style.height =
            `${height}px`;


        this.setPosition(

            button.offsetLeft,

            button.offsetTop

        );


        /* Enable Animation After Layout */

        if (!this.nav.classList.contains(
            "liquid-ready"
        )) {

            this.indicator.getBoundingClientRect();

            this.nav.classList.add(
                "liquid-ready"
            );

        }

    }


    /* ====================================
       6. HANDLE LAYOUT CHANGES
       ==================================== */

    handleLayoutChange() {

        if (!this.initialized) return;


        /* Cancel Gesture During Rotation */

        if (this.pointerId !== null) {

            this.resetGesture();

            this.protectNextClick();

        }


        /* Recalculate Without Sliding */

        this.nav.classList.remove(
            "liquid-ready"
        );

        this.update();

    }


    /* ====================================
       7. POINTER DOWN
       ==================================== */

    handlePointerDown(event) {

        if (!this.mobile.matches) return;

        if (!this.nav.classList.contains(
            "liquid-ready"
        )) return;

        if (this.pointerId !== null) return;

        if (!event.isPrimary) return;

        if (event.button !== 0) return;


        const button = event.target.closest(
            ".nav-button"
        );


        if (!button) return;


        const activeButton =
            this.getActiveButton();


        if (!activeButton) return;


        this.clearClickProtection();


        /* Save Gesture State */

        this.pointerId = event.pointerId;

        this.startX = event.clientX;

        this.pressedButton = button;

        this.dragging = false;


        /* Capture Current Visual Position */

        this.originX =
            this.getVisualPosition();

        this.currentX = this.originX;


        /* Capture Pointer */

        try {

            this.nav.setPointerCapture(
                event.pointerId
            );

        } catch (error) {

            this.resetGesture();

            return;

        }


        /* Compress Capsule */

        this.nav.classList.add(
            "is-pressed"
        );

    }


    /* ====================================
       8. POINTER MOVE
       ==================================== */

handlePointerMove(event) {

    if (event.pointerId !== this.pointerId) {
        return;
    }


    const deltaX =
        event.clientX - this.startX;


    /* Start Sliding */

    if (

        !this.dragging &&

        Math.abs(deltaX) >
        this.dragThreshold

    ) {

        const visualX =
            this.getVisualPosition();


        this.originX =
            visualX - deltaX;


        this.dragging = true;


        this.nav.classList.add(
            "is-dragging"
        );


        /* Freeze Current Capsule Position */

        const activeButton =
            this.getActiveButton();


        if (activeButton) {

            this.setPosition(

                visualX,

                activeButton.offsetTop

            );

        }

    }


    if (!this.dragging) return;


    /* Save Latest Pointer Position */

    this.pendingPointerX =
        event.clientX;


    /* Synchronize With Display Refresh */

    if (this.dragFrame !== null) return;


    this.dragFrame = requestAnimationFrame(() => {

        this.dragFrame = null;


        if (

            this.pointerId === null ||

            !this.dragging ||

            this.pendingPointerX === null

        ) {

            return;

        }


        this.moveCapsule(
            this.pendingPointerX
        );


        this.pendingPointerX = null;

    });

}


    /* ====================================
       9. MOVE CAPSULE
       ==================================== */

    moveCapsule(clientX) {

        const buttons = this.getButtons();

        const activeButton =
            this.getActiveButton();


        if (!buttons.length || !activeButton) {
            return;
        }


        const deltaX =
            clientX - this.startX;


        const firstButton = buttons[0];

        const lastButton =
            buttons[buttons.length - 1];


        /* Movement Boundaries */

        const minX =
            firstButton.offsetLeft;


        const maxX = Math.max(

            minX,

            lastButton.offsetLeft

            + lastButton.offsetWidth

            - this.indicator.offsetWidth

        );


        /* Clamp Position */

        const nextX = Math.max(

            minX,

            Math.min(

                maxX,

                this.originX + deltaX

            )

        );


        this.setPosition(

            nextX,

            activeButton.offsetTop

        );

    }


    /* ====================================
       10. FIND NEAREST BUTTON
       ==================================== */

    getNearestButton() {

        const buttons = this.getButtons();


        const capsuleCenter =

            this.currentX

            + this.indicator.offsetWidth / 2;


        let nearestButton = null;

        let nearestDistance = Infinity;


        buttons.forEach(button => {

            const buttonCenter =

                button.offsetLeft

                + button.offsetWidth / 2;


            const distance = Math.abs(

                buttonCenter - capsuleCenter

            );


            if (distance < nearestDistance) {

                nearestDistance = distance;

                nearestButton = button;

            }

        });


        return nearestButton;

    }


    /* ====================================
       11. POINTER UP
       ==================================== */

    handlePointerUp(event) {

        if (event.pointerId !== this.pointerId) {
            return;
        }


        /* Update Final Pointer Position */

        if (this.dragging) {

            this.moveCapsule(
                event.clientX
            );

        }


        /* Determine Destination */

        const targetButton = this.dragging

            ? this.getNearestButton()

            : this.pressedButton;


        /* Restore Normal Shape */

        this.resetGesture();


        /* Prevent Duplicate Native Click */

        this.protectNextClick();


        /* Commit Navigation */

        if (targetButton) {

            targetButton.click();

        }


        /* Snap Into Position */

        this.update();

    }


    /* ====================================
       12. CANCEL GESTURE
       ==================================== */

    handlePointerCancel(event) {

        if (event.pointerId !== this.pointerId) {
            return;
        }


        this.resetGesture();

        this.protectNextClick();

        this.update();

    }


    /* ====================================
       13. RESET GESTURE STATE
       ==================================== */

   resetGesture() {

    /* Cancel Pending Animation Frame */

    if (this.dragFrame !== null) {

        cancelAnimationFrame(
            this.dragFrame
        );

        this.dragFrame = null;

    }


    this.pendingPointerX = null;


    /* Reset Gesture State */

    const previousPointer =
        this.pointerId;


    this.pointerId = null;

    this.pressedButton = null;

    this.dragging = false;


    this.nav.classList.remove(

        "is-pressed",

        "is-dragging"

    );


    /* Restore CSS Transitions */

    this.indicator.getBoundingClientRect();


    /* Release Pointer Capture */

    if (

        previousPointer !== null &&

        this.nav.hasPointerCapture(
            previousPointer
        )

    ) {

        this.nav.releasePointerCapture(
            previousPointer
        );

    }

}


    /* ====================================
       14. CLICK PROTECTION
       ==================================== */

    protectNextClick() {

        this.clearClickProtection();


        this.suppressClick = true;


        this.suppressTimer = setTimeout(() => {

            this.suppressClick = false;

            this.suppressTimer = null;

        }, 400);

    }


    clearClickProtection() {

        this.suppressClick = false;


        if (this.suppressTimer !== null) {

            clearTimeout(
                this.suppressTimer
            );

            this.suppressTimer = null;

        }

    }


    handleClick(event) {

        if (!this.suppressClick) return;


        /* Preserve Keyboard And Programmatic
           Button Activation */

        if (event.detail === 0) return;


        event.preventDefault();

        event.stopImmediatePropagation();


        this.clearClickProtection();

    }


    /* ====================================
       15. CLEANUP
       ==================================== */

    destroy() {

        if (!this.initialized) return;


        this.resetGesture();

        this.clearClickProtection();


        this.observer?.disconnect();

        this.resizeObserver?.disconnect();


        this.nav.removeEventListener(

            "pointerdown",

            this.handlePointerDown

        );


        this.nav.removeEventListener(

            "pointermove",

            this.handlePointerMove

        );


        this.nav.removeEventListener(

            "pointerup",

            this.handlePointerUp

        );


        this.nav.removeEventListener(

            "pointercancel",

            this.handlePointerCancel

        );


        this.nav.removeEventListener(

            "lostpointercapture",

            this.handlePointerCancel

        );


        this.nav.removeEventListener(

            "click",

            this.handleClick,

            true

        );


        window.removeEventListener(

            "resize",

            this.handleLayoutChange

        );


        this.mobile.removeEventListener(

            "change",

            this.handleLayoutChange

        );


        this.nav.classList.remove(
            "liquid-ready"
        );


        this.indicator.remove();


        this.initialized = false;

    }

}

