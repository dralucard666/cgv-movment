import { Box3, BoxGeometry, BufferGeometry, Color, Mesh, MeshBasicMaterial, Object3D, Scene, Vector3 } from "three"
import { combineLatest, Observable, of, switchMap } from "rxjs"
import { defaultOperations } from ".."
import { Operations, simpleExecution, simpleSceneExecution } from "../../interpreter"
import { ObjectPosition, ObjectType, MovingObject, Primitive } from "./primitives"
import { createPhongMaterialGenerator, PointPrimitive } from "../shape/primitive"
import { makeTranslationMatrix } from "../shape"
import Seedrandom from "seedrandom"

export type possibleAngles = 0 | 30 | 60 | 90 | 120 | 150 | 180 | 210 | 240 | 270 | 300 | 330 | 360

export type possibleDistance = number

function computeMoveRight(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveRight(distance)]
}

function computeMoveLeft(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveLeft(distance)]
}

function computeMoveUp(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveUp(distance)]
}

function computeMoveDown(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveDown(distance)]
}

function computeMoveRotate(
    instance: MovingObject,
    angle: possibleAngles,
    distance: possibleDistance
): Array<MovingObject> {
    return [instance.moveRotate(angle, distance)]
}

function computeMoveRotateAvoid(
    instance: MovingObject,
    angle: possibleAngles,
    distance: possibleDistance
): Array<MovingObject> {
    return [instance.moveRotateTurnClock(angle, distance)]
}

function computeStandStill(instance: MovingObject): Array<MovingObject> {
    return [instance.standStill()]
}

function createObject(
    variables: {
        [x: string]: any
    },
    position: Vector3,
    time: number,
    type: ObjectType,
    angle: number
): Array<MovingObject> {
    const seed = variables.seed
    const environment = variables.environment
    const direction = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), (angle / 180) * Math.PI)
    return [new MovingObject([{ position, time, direction } as ObjectPosition], type, [], environment)]
}

function createPedestrian(
    variables: {
        [x: string]: any
    },
    position: Vector3,
    time: number,
    angle: number
): Array<MovingObject> {
    const seed = variables.seed
    const environment = variables.environment
    const direction = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), (angle / 180) * Math.PI)
    return [new MovingObject([{ position, time, direction } as ObjectPosition], ObjectType.Pedestrian, [], environment)]
}

function createCyclist(
    variables: {
        [x: string]: any
    },
    position: Vector3,
    time: number,
    angle: number
): Array<MovingObject> {
    const seed = variables.seed
    const environment = variables.environment
    const direction = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), (angle / 180) * Math.PI)
    return [new MovingObject([{ position, time, direction } as ObjectPosition], ObjectType.Cyclist, [], environment)]
}

function createCar(
    variables: {
        [x: string]: any
    },
    position: Vector3,
    time: number,
    angle: number
): Array<MovingObject> {
    const seed = variables.seed
    const environment = variables.environment
    const direction = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), (angle / 180) * Math.PI)
    return [new MovingObject([{ position, time, direction } as ObjectPosition], ObjectType.Car, [], environment)]
}

function createObjectOfPrimitive(
    variables: {
        [x: string]: any
    },
    instance: Primitive,
    time: number,
    type: ObjectType,
    angle: number
): Array<MovingObject> {
    const seed = variables.seed
    const environment = variables.environment
    const direction = new Vector3(1, 0, 0).applyAxisAngle(new Vector3(0, 1, 0), (-angle / 180) * Math.PI)
    return [instance.createMovementObject(time, direction, type)]
}

function computePoint3(x: number, y: number, z: number): Array<Vector3> {
    return [new Vector3(x, y, z)]
}

function distanceToStatic(instance: MovingObject): Array<Vector3> {
    return [instance.staticObjectAhead()]
}

function computeSample(
    variables: {
        [x: string]: any
    },
    amount: number
): Array<Primitive> {
    const seed = variables.seed
    const environment = variables.environment

    const primitiveArray: Primitive[] = []
    for (let index = 0; index < amount; index++) {
        const x = Seedrandom(seed + "x" + index)()
        const y = Seedrandom(seed + "y" + index)()
        const xArea = Seedrandom(seed + "areax" + index)()
        const yArea = Seedrandom(seed + "areay" + index)()
        if (xArea < 0.3) {
            const pseudoX = Math.round(x * 1240) - 700
            const pseudoY = Math.round(y * 980) - 480
            primitiveArray.push(new Primitive(new Vector3(pseudoX, 0, pseudoY), [], environment))
        } else if (xArea >= 0.3 && yArea > 0.4) {
            const pseudoX = Math.round(x * 900) - 540
            const pseudoY = Math.round(y * 290) - 220
            primitiveArray.push(new Primitive(new Vector3(pseudoX, 0, pseudoY), [], environment))
        } else if (xArea >= 0.3 && yArea <= 0.4) {
            const pseudoX = Math.round(x * 1170) - 670
            const pseudoY = Math.round(y * 250) + 270
            primitiveArray.push(new Primitive(new Vector3(pseudoX, 0, pseudoY), [], environment))
        }
    }
    return primitiveArray
}

function addCubengle(position: Vector3, sideLength: number): Array<Object3D> {
    const material = new MeshBasicMaterial({ color: 0x808080 })
    const geometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const mesh = new Mesh(geometry, material)
    mesh.position.set(...position.toArray())
    return [mesh]
}

function computeMultipleStatic(...val: any[]) {
    return [val.filter((v) => v instanceof Mesh)]
}
function upAvoid(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveUpAvoid(distance)]
}

function downAvoid(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveDownAvoid(distance)]
}

function rightAvoid(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveRightAvoid(distance)]
}

function leftAvoid(instance: MovingObject, distance: number): Array<MovingObject> {
    return [instance.moveLeftAvoid(distance)]
}

export const operations: Operations<any> = {
    ...defaultOperations,
    createOb: {
        execute: simpleSceneExecution<any>(createObject),
        includeThis: false,
        changesTime: true,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                changesTime: false,
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
        ],
    },
    pedestrian: {
        execute: simpleSceneExecution<any>(createPedestrian),
        includeThis: false,
        changesTime: true,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                changesTime: false,
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
        ],
    },
    cyclist: {
        execute: simpleSceneExecution<any>(createCyclist),
        includeThis: false,
        changesTime: true,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                changesTime: false,
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
        ],
    },
    car: {
        execute: simpleSceneExecution<any>(createCar),
        includeThis: false,
        changesTime: true,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                changesTime: false,
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
        ],
    },
    createFromPrimitive: {
        execute: simpleSceneExecution<any>(createObjectOfPrimitive),
        includeThis: true,
        changesTime: true,
        defaultParameters: [
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
        ],
    },
    point3: {
        execute: simpleExecution<any>(computePoint3),
        includeThis: false,
        changesTime: false,
        defaultParameters: [
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
        ],
    },
    moveRight: {
        execute: simpleExecution<any>(computeMoveRight),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveLeft: {
        execute: simpleExecution<any>(computeMoveLeft),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveUp: {
        execute: simpleExecution<any>(computeMoveUp),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveDown: {
        execute: simpleExecution<any>(computeMoveDown),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveUpAvoid: {
        execute: simpleExecution<any>(upAvoid),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveDownAvoid: {
        execute: simpleExecution<any>(downAvoid),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveRightAvoid: {
        execute: simpleExecution<any>(rightAvoid),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveLeftAvoid: {
        execute: simpleExecution<any>(leftAvoid),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveRotate: {
        execute: simpleExecution<any>(computeMoveRotate),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 0 }), () => ({ type: "raw", value: 50 })],
    },
    moveRotateAvoid: {
        execute: simpleExecution<any>(computeMoveRotateAvoid),
        includeThis: true,
        changesTime: true,
        defaultParameters: [() => ({ type: "raw", value: 0 }), () => ({ type: "raw", value: 50 })],
    },
    standStill: {
        execute: simpleExecution<any>(computeStandStill),
        includeThis: true,
        changesTime: true,
        defaultParameters: [],
    },
    distanceToStatic: {
        execute: simpleExecution<any>(distanceToStatic),
        includeThis: true,
        changesTime: false,
        defaultParameters: [],
    },
    sample: {
        execute: simpleSceneExecution<any>(computeSample),
        includeThis: false,
        changesTime: false,
        defaultParameters: [() => ({ type: "raw", value: 10 })],
    },
    cube: {
        execute: simpleExecution<any>(addCubengle),
        includeThis: false,
        changesTime: false,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                changesTime: false,
                children: [
                    { type: "raw", value: 1 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 100 }),
        ],
    },
    multipleStatic: {
        execute: simpleExecution<any>(computeMultipleStatic),
        includeThis: false,
        changesTime: false,
        defaultParameters: [],
    },
}
