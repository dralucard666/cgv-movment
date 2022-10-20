import { MovingObject, ObjectPosition, ObjectType, Primitive, standardTime } from "cgv/domains/movement"
import { Value } from "cgv/interpreter"
import { Observable, Subscription, tap } from "rxjs"
import { Object3D } from "three"
import { ChangeType, valuesToChanges } from "cgv/interpreter"
import { framePositions, movObject, TimeState, useMovementStore } from "./useMovementStore"
import { PathNode, TimeEditState, useTimeEditStore } from "./TimeEdit/useTimeEditStore"
import { StoreApi, UseBoundStore } from "zustand"

export function applyToObject3D(
    input: Observable<Value<Primitive>>,
    name: string,
    object: Object3D,
    toObject: (value: Value<Primitive>) => Object3D,
    onError: (error: any) => void
): Subscription {
    return input.subscribe({
        next: (change) => {
            const data = change.raw
            if (data instanceof MovingObject) {
                const startTime = data.position[0].time * standardTime
                const endTime = data.position[data.position.length - 1].time * standardTime
                let nameWithSplit = name
                if (nameWithSplit) {
                    nameWithSplit = name + change.index[0]
                }
                const id = nameWithSplit + change.index.map((v) => "_" + v).join(",")
                const framePositions = formatToTimeData(data.position, startTime, endTime)
                createTimeEditTree(nameWithSplit, id, useMovementStore, data, framePositions)
                if (useMovementStore.getState().maxTime < endTime) {
                    useMovementStore.getState().setMaxTime(endTime)
                }
                if (useMovementStore.getState().minTime > startTime) {
                    useMovementStore.getState().setMinTime(startTime)
                }
            }
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
    if (!pathTree.some((v) => v.key == name)) {
        pathTree.push({ key: name, children: {} } as PathNode)
    }
    let node = pathTree.find((v) => v.key == name) as PathNode
    for (let index = 0; index < data.grammarSteps.length; index++) {
        const step = data.grammarSteps[index]
        const path = step.path.slice(1).toString()
        const currentPos = framePositions[index]
        if (path) {
            const newNode = node.children[path]
            if (!newNode) {
                let operation = undefined
                if (step.type == "operation") {
                    operation = { name: step.identifier, parameter: step.children }
                }
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
    const root = pathTree.find((v) => v.key == name) as PathNode
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
