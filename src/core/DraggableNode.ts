import { Vec2 } from '../types/types';

export class DraggableNode {
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private velocity: Vec2 = new Vec2();
    private lastPos: Vec2 = new Vec2();
    private targetPos: Vec2 = new Vec2();
    private isAnimating: boolean = false;

    constructor(
        private pos: Vec2,
        private onPositionUpdate: (pos: Vec2) => void
    ) {
        this.lastPos = new Vec2(pos.x, pos.y);
        this.targetPos = new Vec2(pos.x, pos.y);
    }

    startDrag(mouseX: number, mouseY: number) {
        this.dragStartX = mouseX - this.pos.x;
        this.dragStartY = mouseY - this.pos.y;
        this.velocity = new Vec2();
        this.isAnimating = false;
    }

    drag(mouseX: number, mouseY: number, bounds?: { min: Vec2, max: Vec2 }) {
        const targetX = mouseX - this.dragStartX;
        const targetY = mouseY - this.dragStartY;

        // Aplicar movimiento suave mientras se arrastra
        const speed = 0.5;
        const newX = this.pos.x + (targetX - this.pos.x) * speed;
        const newY = this.pos.y + (targetY - this.pos.y) * speed;

        // Actualizar velocidad
        this.velocity.x = newX - this.lastPos.x;
        this.velocity.y = newY - this.lastPos.y;

        this.lastPos.x = this.pos.x;
        this.lastPos.y = this.pos.y;
        this.pos.x = newX;
        this.pos.y = newY;

        this.onPositionUpdate(this.pos);
    }

    endDrag() {
        if (!this.isAnimating) {
            const velocityMagnitude = Math.sqrt(
                this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y
            );

            if (velocityMagnitude > 0.01) {
                // Limitar la velocidad máxima para evitar movimientos extremos
                const maxVelocity = 0.5;
                const scale = Math.min(1, maxVelocity / velocityMagnitude);
                this.velocity.x *= scale;
                this.velocity.y *= scale;

                // Calcular posición objetivo con overshoot limitado
                const overshootMultiplier = Math.min(10, velocityMagnitude * 20);
                this.targetPos.x = this.pos.x + this.velocity.x * overshootMultiplier;
                this.targetPos.y = this.pos.y + this.velocity.y * overshootMultiplier;

                // Limitar la distancia máxima de overshoot
                const maxOvershoot = 2.0;
                const dx = this.targetPos.x - this.pos.x;
                const dy = this.targetPos.y - this.pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > maxOvershoot) {
                    const scale = maxOvershoot / distance;
                    this.targetPos.x = this.pos.x + dx * scale;
                    this.targetPos.y = this.pos.y + dy * scale;
                }

                this.animateToPosition(this.targetPos.x, this.targetPos.y);
            }
        }
    }

    private animateToPosition(targetX: number, targetY: number) {
        this.isAnimating = true;
        let startTime: number | null = null;
        const initialX = this.pos.x;
        const initialY = this.pos.y;
        const duration = 500; // duración en ms

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = (timestamp - startTime) / duration;

            if (progress < 1) {
                // Aplicar easing
                const easeProgress = this.easeOutElastic(progress);
                
                this.pos.x = initialX + (targetX - initialX) * easeProgress;
                this.pos.y = initialY + (targetY - initialY) * easeProgress;

                this.onPositionUpdate(this.pos);
                requestAnimationFrame(animate);
            } else {
                this.pos.x = targetX;
                this.pos.y = targetY;
                this.onPositionUpdate(this.pos);
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(animate);
    }

    private easeOutElastic(t: number): number {
        const p = 0.3;
        return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    }

    getPosition(): Vec2 {
        return this.pos;
    }
}