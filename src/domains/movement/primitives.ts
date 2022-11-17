import { of } from "rxjs"
import { Box3, Object3D, Raycaster, Scene, Vector3 } from "three"
import { AbstractParsedSteps } from "../../parser"
import { HierarchicalInfo } from "../../util"
import { possibleAngles, possibleDistance } from "./operations"

export enum ObjectType {
    Pedestrian,
    Cyclist,
    Car,
}

export const standardTime = 40
export const standardSteps = 1

export interface ObjectPosition {
    position: Vector3
    time: number
    direction: Vector3
}

export class Primitive {
    constructor(
        public staticObjects: Object3D[],
        public startPosition: Vector3,
        public grammarSteps: AbstractParsedSteps<HierarchicalInfo>[],
        public totalWorld: Object3D[]
    ) {}

    createMovementObject(time: number, direction: Vector3, type: ObjectType) {
        return new MovingObject(
            [{ position: this.startPosition, time, direction } as ObjectPosition],
            type,
            this.staticObjects,
            [...this.grammarSteps],
            this.totalWorld
        )
    }
}

export class MovingObject extends Primitive {
    constructor(
        public position: ObjectPosition[],
        public type: ObjectType,
        public staticObjects: Object3D[],
        public grammarSteps: AbstractParsedSteps<HierarchicalInfo>[],
        public totalWorld: Object3D[]
    ) {
        super(staticObjects, position[0].position, grammarSteps, totalWorld)

        /*         console.log(staticObjects)
        console.log(this.totalWorld)
        if (this.totalWorld.length > 0) {
            this.staticObjects.map((v) => this.totalWorld[0].add(v))
        }
        console.log(this.totalWorld) */
    }

    moveRight(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setX(oldPo.position.x + distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(1, 0, 0) })
        return new MovingObject(newPosArray, this.type, this.staticObjects, [...this.grammarSteps], this.totalWorld)
    }

    moveLeft(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setX(oldPo.position.x - distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(-1, 0, 0) })
        return new MovingObject(newPosArray, this.type, this.staticObjects, [...this.grammarSteps], this.totalWorld)
    }

    moveUp(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setZ(oldPo.position.z + distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(0, 0, 1) })
        return new MovingObject(newPosArray, this.type, this.staticObjects, [...this.grammarSteps], this.totalWorld)
    }

    moveDown(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setZ(oldPo.position.z - distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(0, 0, -1) })
        return new MovingObject(newPosArray, this.type, this.staticObjects, [...this.grammarSteps], this.totalWorld)
    }

    moveUpAvoid(distance: number) {
        const currentPo = this.position[this.position.length - 1]
        const raycaster = new Raycaster(currentPo.position, new Vector3(0, 0, 1), undefined, distance)
        if (this.totalWorld.length > 0) {
            const world = this.totalWorld[0]!
            const intersectedObjects = raycaster.intersectObjects([world], true)
            if (intersectedObjects.length == 0) {
                return this.moveUp(distance)
            }
            return this.moveRight(distance)
        }
        return this.moveUp(distance)
    }

    moveDownAvoid(distance: number) {
        const currentPo = this.position[this.position.length - 1]
        const raycaster = new Raycaster(currentPo.position, new Vector3(0, 0, -1), undefined, distance)
        if (this.totalWorld.length > 0) {
            const world = this.totalWorld[0]!
            const intersectedObjects = raycaster.intersectObjects([world], true)
            if (intersectedObjects.length == 0) {
                return this.moveDown(distance)
            }
            return this.moveRight(distance)
        }
        return this.moveDown(distance)
    }

    moveLeftAvoid(distance: number) {
        const currentPo = this.position[this.position.length - 1]
        const raycaster = new Raycaster(currentPo.position, new Vector3(-1, 0, 0), undefined, distance)
        if (this.totalWorld.length > 0) {
            const world = this.totalWorld[0]!
            const intersectedObjects = raycaster.intersectObjects([world], true)
            if (intersectedObjects.length == 0) {
                return this.moveLeft(distance)
            }
            return this.moveUp(distance)
        }
        return this.moveLeft(distance)
    }

    moveRightAvoid(distance: number) {
        const currentPo = this.position[this.position.length - 1]
        const raycaster = new Raycaster(currentPo.position, new Vector3(1, 0, 0), undefined, distance)
        if (this.totalWorld.length > 0) {
            const world = this.totalWorld[0]!
            const intersectedObjects = raycaster.intersectObjects([world], true)
            if (intersectedObjects.length == 0) {
                return this.moveRight(distance)
            }
            return this.moveUp(distance)
        }
        return this.moveRight(distance)
    }

    moveRotate(angle: possibleAngles, distance: possibleDistance) {
        const oldPo = this.position[this.position.length - 1]
        const direction = oldPo.direction.clone()
        const newDirection = direction.applyAxisAngle(new Vector3(0, 1, 0), (-angle / 180) * Math.PI)
        const newPo = {
            position: oldPo.position.clone().add(newDirection.multiplyScalar(distance)),
            time: oldPo.time + standardSteps,
        } as ObjectPosition
        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: newDirection.normalize() })
        return new MovingObject(newPosArray, this.type, this.staticObjects, [...this.grammarSteps], this.totalWorld)
    }

    moveRotateTurnClock(angle: possibleAngles, distance: possibleDistance) {
        if (this.totalWorld.length > 0) {
            const world = this.totalWorld[0]!
            const currentPo = this.position[this.position.length - 1].position.clone()
            const direction = this.position[this.position.length - 1].direction.clone().normalize()
            const positionBehind = currentPo

            for (let i = 0; i < 12; i++) {
                const newAngle = angle + i * 30
                const newDirection = direction.clone().applyAxisAngle(new Vector3(0, 1, 0), (-newAngle / 180) * Math.PI)
                const raycaster = new Raycaster(positionBehind, newDirection, undefined, distance)

                const intersectedObjects = raycaster.intersectObjects([world], true)
                if (intersectedObjects.length == 0) {
                    return this.moveRotate(newAngle as possibleAngles, distance)
                }
            }
            return this.moveRight(distance)
        } else {
            return this.moveRotate(angle as possibleAngles, distance)
        }
    }

    standStill() {
        const oldPo = this.position[this.position.length - 1]
        const oldTime = oldPo.time
        const newPosArray = structuredClone(this.position)
        newPosArray.push({ position: oldPo.position, direction: oldPo.direction, time: oldTime + standardSteps })
        return new MovingObject(newPosArray, this.type, this.staticObjects, [...this.grammarSteps], this.totalWorld)
    }

    staticObjectAhead() {
        const staticOb = new Vector3(12, -5, 0)
        const staticOb2 = new Vector3(12, 5, 0)
        const obPos = this.position[this.position.length - 1].position
        const direction = this.position[this.position.length - 1].direction.multiplyScalar(10)
        const futureObPos = new Vector3(0, 0, 0).addVectors(obPos, direction)
        return new Vector3(0, 0, 0).subVectors(obPos, staticOb)
    }
}

function ccw(A: Vector3, B: Vector3, C: Vector3) {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x)
}

// Return true if line segments AB and CD intersect
function intersect(A: Vector3, B: Vector3, C: Vector3, D: Vector3) {
    return ccw(A, C, D) != ccw(B, C, D) && ccw(A, B, C) != ccw(A, B, D)
}
