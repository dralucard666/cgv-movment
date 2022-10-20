import { of } from "rxjs"
import { Vector3 } from "three"
import { AbstractParsedSteps } from "../../parser"
import { HierarchicalInfo } from "../../util"
import { possibleAngles, possibleDistance } from "./operations"

export enum ObjectType {
    Pedestrian,
    Cyclist,
    Car,
}

export const standardTime = 20
export const standardSteps = 1

export interface ObjectPosition {
    position: Vector3
    time: number
    direction: Vector3
}

export class Primitive {
    constructor(
        public staticObjects: any[],
        public startPosition: Vector3,
        public grammarSteps: AbstractParsedSteps<HierarchicalInfo>[],
        public parallelParentStep: { time: number; step: AbstractParsedSteps<HierarchicalInfo> } | null
    ) {}

    createMovementObject(time: number, direction: Vector3, type: ObjectType) {
        return new MovingObject(
            [{ position: this.startPosition, time, direction } as ObjectPosition],
            type,
            this.staticObjects,
            [...this.grammarSteps],
            this.parallelParentStep
        )
    }
}

export class MovingObject extends Primitive {
    constructor(
        public position: ObjectPosition[],
        public type: ObjectType,
        public staticObjects: any[],
        public grammarSteps: AbstractParsedSteps<HierarchicalInfo>[],
        public parallelParentStep: { time: number; step: AbstractParsedSteps<HierarchicalInfo> } | null
    ) {
        super(staticObjects, position[0].position, grammarSteps, parallelParentStep)
    }

    moveRight(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setX(oldPo.position.x + distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(1, 0, 0) })
        return new MovingObject(
            newPosArray,
            this.type,
            this.staticObjects,
            [...this.grammarSteps],
            structuredClone(this.parallelParentStep)
        )
    }

    moveLeft(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setX(oldPo.position.x - distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(-1, 0, 0) })
        return new MovingObject(
            newPosArray,
            this.type,
            this.staticObjects,
            [...this.grammarSteps],
            structuredClone(this.parallelParentStep)
        )
    }

    moveUp(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setZ(oldPo.position.z + distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(0, 0, 1) })
        return new MovingObject(
            newPosArray,
            this.type,
            this.staticObjects,
            [...this.grammarSteps],
            structuredClone(this.parallelParentStep)
        )
    }

    moveDown(distance: number) {
        const oldPo = this.position[this.position.length - 1]
        const newPo = {
            position: oldPo.position.clone().setZ(oldPo.position.z - distance),
            time: oldPo.time + standardSteps,
        } as ObjectPosition

        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: new Vector3(0, 0, -1) })
        return new MovingObject(
            newPosArray,
            this.type,
            this.staticObjects,
            [...this.grammarSteps],
            structuredClone(this.parallelParentStep)
        )
    }

    moveRotate(angle: possibleAngles, distance: possibleDistance) {
        const oldPo = this.position[this.position.length - 1]
        const direction = this.position[this.position.length - 1].direction
        const newDirection = direction.applyAxisAngle(new Vector3(0, 1, 0), (-angle / 180) * Math.PI)
        const newPo = {
            position: oldPo.position.clone().add(newDirection.multiplyScalar(distance)),
            time: oldPo.time + standardSteps,
        } as ObjectPosition
        const newPosArray = structuredClone(this.position)
        newPosArray.push({ ...newPo, direction: newDirection })
        return new MovingObject(
            newPosArray,
            this.type,
            this.staticObjects,
            [...this.grammarSteps],
            structuredClone(this.parallelParentStep)
        )
    }

    standStill() {
        const oldPo = this.position[this.position.length - 1]
        const oldTime = oldPo.time
        const newPosArray = structuredClone(this.position)
        newPosArray.push({ position: oldPo.position, direction: oldPo.direction, time: oldTime + standardSteps })
        return new MovingObject(
            newPosArray,
            this.type,
            this.staticObjects,
            [...this.grammarSteps],
            structuredClone(this.parallelParentStep)
        )
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
