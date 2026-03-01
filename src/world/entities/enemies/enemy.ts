import {WorldEntity, type WorldEntityProps} from "@src/world/entities/world-entity";
import {pointDistance, stepTo} from "@src/util";
import {Player} from "@src/world/entities/player";
import {Jam} from "@src/world/entities/pickups/jam";


export class Enemy extends WorldEntity {

    public attackTimer = 0;
    public attackDelay = 1.5;
    public attackDamage = Math.ceil(100 / 6);

    public dead: boolean = false;
    public deathTimer = 0;
    public deathDelay = 1;

    public health: number = 1;

    constructor(props: WorldEntityProps) {
        super(props);
    }

    update(delta: number) {
        super.update(delta);

        this.attackTimer = stepTo(this.attackTimer, 0, delta);

        if (this.dead) {
            this.deathTimer = stepTo(this.deathTimer, 0, delta);
            if (this.deathTimer == 0) {
                this.remove = true;
            }
        }
    }

    collideWith(other: WorldEntity) {
        super.collideWith(other);

        if (!this.dead && other instanceof Player && this.attackTimer == 0) {
            this.attackTimer = this.attackDelay;
            const knockback = 2;
            const dist = pointDistance(this.x, this.y, other.x, other.y);
            if (!other.dead) {
                other.ex += (other.x - this.x) / dist * knockback;
                other.ey += (other.y - this.y) / dist * knockback;
            }
            other.dealDamage(this.attackDamage);
        }
    }

    kill() {
        this.dead = true;
        this.deathTimer = this.deathDelay;
        this.hitScanable = false;

        if (Math.random() < 0.2) {
            this.world?.addEntity(new Jam({ x: this.x, y: this.y }));
        }
    }

    damage() {
        this.health--;
        if (this.health <= 0) {
            this.kill();
        }
    }
}