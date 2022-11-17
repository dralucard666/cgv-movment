import { Box3, BoxGeometry, BufferGeometry, Color, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three"
import { Observable, of } from "rxjs"
import { defaultOperations } from ".."
import { Operations, simpleExecution } from "../../interpreter"
import { ObjectPosition, ObjectType, MovingObject, Primitive } from "./primitives"
import { createPhongMaterialGenerator, PointPrimitive } from "../shape/primitive"
import { makeTranslationMatrix } from "../shape"

export type possibleAngles = 0 | 30 | 60 | 90 | 120 | 150 | 180 | 210 | 240 | 270 | 300 | 330 | 360

export type possibleDistance = number

function computeMoveRight(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveRight(distance)])
}

function computeMoveLeft(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveLeft(distance)])
}

function computeMoveUp(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveUp(distance)])
}

function computeMoveDown(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveDown(distance)])
}

function computeMoveRotate(
    instance: MovingObject,
    angle: possibleAngles,
    distance: possibleDistance
): Observable<Array<MovingObject>> {
    return of([instance.moveRotate(angle, distance)])
}

function computeMoveRotateAvoid(
    instance: MovingObject,
    angle: possibleAngles,
    distance: possibleDistance
): Observable<Array<MovingObject>> {
    return of([instance.moveRotateTurnClock(angle, distance)])
}

function computeStandStill(instance: MovingObject): Observable<Array<MovingObject>> {
    return of([instance.standStill()])
}

function createObject(
    position: Vector3,
    time: number,
    type: ObjectType,
    direction: Vector3
): Observable<Array<MovingObject>> {
    return of([new MovingObject([{ position, time, direction } as ObjectPosition], type, [], [], [])])
}

function createPedestrian(
    position: Vector3,
    time: number,
    direction: Vector3,
    staticObjects: Object3D[]
): Observable<Array<MovingObject>> {
    return of([
        new MovingObject(
            [{ position, time, direction } as ObjectPosition],
            ObjectType.Pedestrian,
            staticObjects,
            [],
            []
        ),
    ])
}

function createCyclist(position: Vector3, time: number, direction: Vector3): Observable<Array<MovingObject>> {
    return of([new MovingObject([{ position, time, direction } as ObjectPosition], ObjectType.Cyclist, [], [], [])])
}

function createCar(position: Vector3, time: number, direction: Vector3): Observable<Array<MovingObject>> {
    return of([new MovingObject([{ position, time, direction } as ObjectPosition], ObjectType.Car, [], [], [])])
}

function createObjectOfPrimitive(
    instance: Primitive,
    time: number,
    type: ObjectType,
    direction: Vector3
): Observable<Array<MovingObject>> {
    return of([instance.createMovementObject(time, direction, type)])
}

function computePoint3(x: number, y: number, z: number): Observable<Array<Vector3>> {
    return of([new Vector3(x, y, z)])
}

function distanceToStatic(instance: MovingObject): Observable<Array<Vector3>> {
    return of([instance.staticObjectAhead()])
}

function computeSample(amount: number): Observable<Array<Primitive>> {
    const primitiveArray: Primitive[] = []
    for (let index = 0; index < amount; index++) {
        primitiveArray.push(
            new Primitive([], new Vector3(Math.random() * 600 - 250, 0, Math.random() * 600 - 350), [], [])
        )
    }
    return of(primitiveArray)
}

function addRectangle(position: Vector3, sideLength: number): Observable<Array<Object3D>> {
    const material = new MeshBasicMaterial({ color: 0x00ff00 })
    const geometry = new BoxGeometry(sideLength, sideLength, sideLength)
    const mesh = new Mesh(geometry, material)
    mesh.position.set(...position.toArray())
    return of([mesh])
}

function computeMultipleStatic(...val: any[]) {
    return of([val.filter((v) => v instanceof Mesh)])
}
function upAvoid(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveUpAvoid(distance)])
}

function downAvoid(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveDownAvoid(distance)])
}

function rightAvoid(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveRightAvoid(distance)])
}

function leftAvoid(instance: MovingObject, distance: number): Observable<Array<MovingObject>> {
    return of([instance.moveLeftAvoid(distance)])
}

export const operations: Operations<any> = {
    ...defaultOperations,
    createOb: {
        execute: simpleExecution<any>(createObject),
        includeThis: false,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 1 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
        ],
    },
    pedestrian: {
        execute: simpleExecution<any>(createPedestrian),
        includeThis: false,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 1 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({
                type: "operation",
                identifier: "multipleStatic",
                children: [],
            }),
        ],
    },
    cyclist: {
        execute: simpleExecution<any>(createCyclist),
        includeThis: false,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 1 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
        ],
    },
    car: {
        execute: simpleExecution<any>(createCar),
        includeThis: false,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
            () => ({ type: "raw", value: 0 }),
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 1 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
        ],
    },
    createFromPrimitive: {
        execute: simpleExecution<any>(createObjectOfPrimitive),
        includeThis: true,
        defaultParameters: [
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
            () => ({
                type: "operation",
                identifier: "point3",
                children: [
                    { type: "raw", value: 1 },
                    { type: "raw", value: 0 },
                    { type: "raw", value: 0 },
                ],
            }),
        ],
    },
    point3: {
        execute: simpleExecution<any>(computePoint3),
        includeThis: false,
        defaultParameters: [
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
            () => ({ type: "raw", value: 0 }),
        ],
    },
    moveRight: {
        execute: simpleExecution<any>(computeMoveRight),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveLeft: {
        execute: simpleExecution<any>(computeMoveLeft),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveUp: {
        execute: simpleExecution<any>(computeMoveUp),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveDown: {
        execute: simpleExecution<any>(computeMoveDown),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveUpAvoid: {
        execute: simpleExecution<any>(upAvoid),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveDownAvoid: {
        execute: simpleExecution<any>(downAvoid),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveRightAvoid: {
        execute: simpleExecution<any>(rightAvoid),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveLeftAvoid: {
        execute: simpleExecution<any>(leftAvoid),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 50 })],
    },
    moveRotate: {
        execute: simpleExecution<any>(computeMoveRotate),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 0 }), () => ({ type: "raw", value: 50 })],
    },
    moveRotateAvoid: {
        execute: simpleExecution<any>(computeMoveRotateAvoid),
        includeThis: true,
        defaultParameters: [() => ({ type: "raw", value: 0 }), () => ({ type: "raw", value: 50 })],
    },
    standStill: {
        execute: simpleExecution<any>(computeStandStill),
        includeThis: true,
        defaultParameters: [],
    },
    distanceToStatic: {
        execute: simpleExecution<any>(distanceToStatic),
        includeThis: true,
        defaultParameters: [],
    },
    sample: {
        execute: simpleExecution<any>(computeSample),
        includeThis: false,
        defaultParameters: [() => ({ type: "raw", value: 10 })],
    },
    rectangle: {
        execute: simpleExecution<any>(addRectangle),
        includeThis: false,
        defaultParameters: [
            () => ({
                type: "operation",
                identifier: "point3",
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
        defaultParameters: [],
    },
}
