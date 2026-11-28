
/* ========================================
   BACKSTAGE by SKAYT
   Spring Physics Engine 1.0
   Continuous Motion
   ======================================== */

export class SpringPhysics {

    /* ====================================
       1. CONSTRUCTOR
       ==================================== */

    constructor(onUpdate) {

        this.onUpdate = onUpdate;

        /* Current Values */

        this.x = 1;
        this.y = 1;

        /* Current Velocity */

        this.vx = 0;
        this.vy = 0;

        /* Target Values */

        this.targetX = 1;
        this.targetY = 1;

        /* Physics Parameters */

        this.stiffness = 170;
        this.damping = 21;

        /* Animation State */

        this.frame = null;
        this.lastTime = 0;

        this.animate = this.animate.bind(this);

    }


    /* ====================================
       2. SET TARGET
       ==================================== */

    setTarget(x, y, stiffness, damping) {

        this.targetX = x;
        this.targetY = y;

        this.stiffness = stiffness;
        this.damping = damping;

        /* Preserve Current Velocity */

        if (this.frame === null) {

            this.lastTime = performance.now();

            this.frame = requestAnimationFrame(
                this.animate
            );

        }

    }


    /* ====================================
       3. PHYSICS ANIMATION
       ==================================== */

    animate(time) {

        const deltaTime = Math.max(
            0,
            Math.min(
                (time - this.lastTime) / 1000,
                0.032
            )
        );

        this.lastTime = time;


        /* Stable Physics Substeps */

        const steps = Math.max(
            1,
            Math.ceil(deltaTime / 0.004)
        );

        const dt = deltaTime / steps;


        for (let i = 0; i < steps; i++) {

            /* Spring Force */

            const forceX =
                this.stiffness *
                (this.targetX - this.x);

            const forceY =
                this.stiffness *
                (this.targetY - this.y);


            /* Damping Force */

            const dampingX =
                this.damping * this.vx;

            const dampingY =
                this.damping * this.vy;


            /* Update Velocity */

            this.vx +=
                (forceX - dampingX) * dt;

            this.vy +=
                (forceY - dampingY) * dt;


            /* Update Position */

            this.x += this.vx * dt;

            this.y += this.vy * dt;

        }


        /* Check Animation Completion */

        const settled =

            Math.abs(this.targetX - this.x)
                < 0.0005 &&

            Math.abs(this.targetY - this.y)
                < 0.0005 &&

            Math.abs(this.vx) < 0.005 &&

            Math.abs(this.vy) < 0.005;


        if (settled) {

            this.x = this.targetX;
            this.y = this.targetY;

            this.vx = 0;
            this.vy = 0;

            this.frame = null;
            this.lastTime = 0;

            this.onUpdate(this.x, this.y);

            return;

        }


        /* Render Current Shape */

        this.onUpdate(this.x, this.y);


        /* Continue Animation */

        this.frame = requestAnimationFrame(
            this.animate
        );

    }


    /* ====================================
       4. IMMEDIATE RESET
       ==================================== */

    reset(x = 1, y = 1) {

        if (this.frame !== null) {

            cancelAnimationFrame(this.frame);

        }

        this.frame = null;
        this.lastTime = 0;

        this.x = x;
        this.y = y;

        this.targetX = x;
        this.targetY = y;

        this.vx = 0;
        this.vy = 0;

        this.onUpdate(this.x, this.y);

    }


    /* ====================================
       5. CLEANUP
       ==================================== */

    destroy() {

        this.reset();

    }

}
