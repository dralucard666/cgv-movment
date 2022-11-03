import { MovingObject, ObjectPosition, ObjectType, Primitive, standardTime } from "cgv/domains/movement"
import { Value } from "cgv/interpreter"
import { Observable, Subscription, tap } from "rxjs"
import { Object3D } from "three"
import { ChangeType, valuesToChanges } from "cgv/interpreter"
import { framePositions, moveData, movObject, TimeState, useMovementStore } from "./useMovementStore"
import { PathNode, TimeEditState, useTimeEditStore } from "./TimeEdit/useTimeEditStore"
import { StoreApi, UseBoundStore } from "zustand"

export function applyToObject3D(
    input: Observable<Value<Primitive>>,
    name: string,
    object: Object3D,
    toObject: (value: Value<Primitive>) => Object3D,
    onError: (error: any) => void,
    setLoadingState: (bool: boolean) => void
): Subscription {
    return input.subscribe({
        next: (change) => {
            const data = change.raw

            if (data instanceof MovingObject) {
                const startStep = data.position[0].time
                const endStep = data.position[data.position.length - 1].time
                const id = name + change.index.map((v) => "_" + v).join(",")
                const framePositions = formatToTimeData(data.position, startStep, endStep)
                const containsSample = data.grammarSteps.some(
                    (v) => v.type === "operation" && v.identifier === "sample"
                )
                const sampleName =
                    name +
                    change.index
                        .slice(0, 1)
                        .map((v) => "_" + v)
                        .join(",")
                const startTime = startStep * standardTime
                const endTime = endStep * standardTime
                createTimeEditTree(containsSample ? sampleName : name, id, useMovementStore, data, framePositions)
                if (useMovementStore.getState().maxTime <= endTime) {
                    useMovementStore.getState().setMaxTime(endTime + 1)
                }
                if (useMovementStore.getState().minTime > startTime) {
                    useMovementStore.getState().setMinTime(startTime)
                }
            } else if (data instanceof Primitive) {
                const containsSample = data.grammarSteps.some(
                    (v) => v.type === "operation" && v.identifier === "sample"
                )
                const sampleName =
                    name +
                    change.index
                        .slice(0, 1)
                        .map((v) => "_" + v)
                        .join(",")
                const pathTree = useMovementStore.getState().treePath
                pathTree.push({
                    type: "nameSample",
                    data: {
                        key: containsSample ? sampleName : name,
                        primitive: data,
                    },
                })
                useMovementStore.getState().setTreePath(pathTree)
            } else {
                const pathTree = useMovementStore.getState().treePath
                pathTree.push({
                    type: "onlyName",
                    data: {
                        key: name,
                        children: {},
                    } as PathNode,
                })
                useMovementStore.getState().setTreePath(pathTree)
            }
            setLoadingState(false)
            return
        },
        error: (error) => {
            onError(error)
        },
    })
}

function createTimeEditTree(
    name: string,
    id: string,
    useMovementStore: UseBoundStore<TimeState, StoreApi<TimeState>>,
    data: MovingObject,
    framePositions: framePositions[]
) {
    const pathTree = useMovementStore.getState().treePath
    if (!pathTree.some((v) => v.data.key == name)) {
        pathTree.push({ type: "moveData", data: { key: name, children: {} } as PathNode } as moveData)
    }
    let node = pathTree.find((v) => v.data.key == name)?.data as PathNode
    let sampleIndex = 0
    for (let index = 0; index < data.grammarSteps.length; index++) {
        const step = data.grammarSteps[index]
        const path = step.path.slice(1).toString()
        const currentPos = framePositions[index - sampleIndex]

        let operation = undefined
        if (step.type == "operation") {
            operation = { name: step.identifier, parameter: step.children }
            if (operation.name === "sample") {
                sampleIndex = 1
            }
        }

        if (path && operation?.name !== "sample") {
            const newNode = node.children[path]
            if (!newNode) {
                node.children = {
                    ...node.children,
                    [path]: {
                        key: path,
                        children: {},
                        path: step.path,
                        operation,
                        framePosition: { ...currentPos, type: data.type, name: id },
                    },
                }
                node = node.children[path]
            } else {
                node = newNode
            }
        }
    }
    useMovementStore.getState().setTreePath(pathTree)
}

function formatToTimeData(data: ObjectPosition[], startTime: number, endTime: number): framePositions[] {
    const framePos = [] as framePositions[]

    for (let x = startTime; x <= endTime; x++) {
        framePos.push({ time: x, position: null, direction: null } as framePositions)
    }
    data.map(({ time, position, direction }) => {
        framePos[time - startTime].position = [position.x, position.y, position.z]
        framePos[time - startTime].direction = [direction.x, direction.y, direction.z]
    })
    return framePos
}
