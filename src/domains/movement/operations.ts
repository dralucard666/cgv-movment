import { Color, Vector3 } from "three"
import { Observable, of } from "rxjs"
import { defaultOperations } from ".."
import { Operations, simpleExecution } from "../../interpreter"
import { ObjectPosition, ObjectType, MovingObject, Primitive } from "./primitives"
import { createPhongMaterialGenerator, PointPrimitive } from "../shape/primitive"
import { makeTranslationMatrix } from "../shape"

export type possibleAngles = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315 | 360

export type possibleDistance = 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20

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

function computeStandStill(instance: MovingObject): Observable<Array<MovingObject>> {
    return of([instance.standStill()])
}

function createObject(
    position: Vector3,
    time: number,
    type: ObjectType,
    direction: Vector3
): Observable<Array<MovingObject>> {
    return of([new MovingObject([{ position, time, direction } as ObjectPosition], type, [], [], null)])
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
            new Primitive([], new Vector3(Math.random() * 600 - 250, 0, Math.random() * 600 - 350), [], null)
        )
    }
    return of(primitiveArray)
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
    moveRotate: {
        execute: simpleExecution<any>(computeMoveRotate),
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
}
