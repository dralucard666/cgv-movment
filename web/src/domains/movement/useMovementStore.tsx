import { AbstractParsedSteps, HierarchicalInfo } from "cgv"
import { ObjectType, standardTime, Primitive } from "cgv/domains/movement"
import { Vector3 } from "three"
import create from "zustand"
import { dataWorldState, WorldState } from "./movementData"

// id, x , y , z, xsize, typeof
export type movObject = {
    id: string
    size: number
    type: ObjectType
    framePos: framePositions[]
    startT: number
    endT: number
    direction: number[]
}
export type framePositions = { time: number; position: number[] | null; direction: number[] | null }

export interface TimeState {
    time: number
    maxTime: number
    minTime: number
    treePath: RowType[]
    setTreePath: (treePath: RowType[]) => void
    data: movObject[] | null
    world: WorldState
    setWorld: (newVal: WorldState) => void
    setData: (newVal: movObject[] | null) => void
    incrementTime: (newVal: number) => void
    setTime: (newVal: number) => void
    action: () => number
    playActive: boolean
    rowData: totalPathData[][]
    setPlayActive: (newBol: boolean) => void
    setMaxTime: (maxTime: number) => void
    setMinTime: (minTime: number) => void
    getPlayActive: () => boolean
    resetState: () => void
    loadingState: boolean
    setLoadingState: (newBol: boolean) => void
}

export type frameData = framePositions & { type: ObjectType; name: string }

export type pathData = frameData & {
    operation?: { name: string; parameter: AbstractParsedSteps<HierarchicalInfo>[] }
    path: [string, ...number[]]
}

export type SinglePathData = { type: "other"; key: string; primitive?: Primitive }
export type MultiPathData = { data: pathData; type: "moveData" }

export type totalPathData = MultiPathData | SinglePathData

export type moveData = {
    data: PathNode
    type: "moveData"
}

export type onlyName = {
    type: "onlyName"
    data: { key: string }
}

export type nameSample = {
    type: "nameSample"
    data: { key: string; primitive: Primitive }
}

export type RowType = moveData | onlyName | nameSample

export interface PathNode {
    key: any // type for unknown keys.
    children: { [key: string]: PathNode } // type for a known property.
    operation?: { name: string; parameter: AbstractParsedSteps<HierarchicalInfo>[] }
    path: [string, ...number[]]
    framePosition: frameData
}

export const useMovementStore = create<TimeState>((set, get) => ({
    treePath: [],
    setTreePath: (newVal: RowType[]) => {
        const rowData = createRowData(newVal)
        const data = movementData(rowData.filter((v) => v[0].type === "moveData") as MultiPathData[][])
        return set((state) => {
            return { treePath: newVal, rowData: rowData, data }
        })
    },
    time: -1,
    minTime: 1000000,
    maxTime: 0,
    data: null,
    rowData: [],
    world: dataWorldState[0],
    setWorld: (newVal: WorldState) =>
        set((state) => {
            return { world: newVal }
        }),
    setData: (newVal: movObject[] | null) =>
        set((state) => {
            return { data: newVal }
        }),
    incrementTime: (newVal: number) =>
        set((state) => {
            const num: number = state.time + newVal
            return { time: num }
        }),
    setTime: (newVal: number) =>
        set((state) => {
            return { time: newVal }
        }),
    action: () => {
        return get().time
    },
    playActive: false,
    setPlayActive: (newBol: boolean) =>
        set((state) => {
            return { playActive: newBol }
        }),
    setMaxTime: (maxTime: number) =>
        set((state) => {
            return { maxTime }
        }),
    setMinTime: (minTime: number) =>
        set((state) => {
            return { minTime, time: minTime }
        }),
    getPlayActive: () => {
        return get().playActive
    },
    resetState: () => {
        set((state) => {
            return {
                time: 0,
                maxTime: 0,
                minTime: 1000000,
                data: null,
            }
        })
    },
    loadingState: false,
    setLoadingState: (newBol: boolean) =>
        set((state) => {
            return { loadingState: newBol }
        }),
}))

function createRowData(treePath: RowType[]): totalPathData[][] {
    const data: totalPathData[][] = []
    const pathData: pathData[][] = []

    const printTreeData = (parentNode: PathNode, ancestorValues: pathData[]) => {
        /*         console.log("neue rekursion")
        console.log(parentNode)
        console.log(ancestorValues) */
        let index = 0
        const onlyParentValue = parentNode.operation
            ? {
                  ...parentNode.framePosition,
                  operation: parentNode.operation,
                  path: parentNode.path,
              }
            : null

        const ancestorCopy = [...ancestorValues]
        if (onlyParentValue) {
            ancestorCopy.push(onlyParentValue)
        }
        //console.log(onlyParentValue)
        //console.log(ancestorCopy)
        for (const [key, value] of Object.entries(parentNode.children)) {
            if (value.children && Object.keys(value.children).length !== 0) {
                if (index == 0 && Object.keys(value.children).length > 0) {
                    printTreeData(value, ancestorCopy)
                    index += 1
                } else {
                    printTreeData(value, onlyParentValue ? [onlyParentValue] : [])
                }
            } else {
                const valueData = { ...value.framePosition, operation: value.operation, path: value.path }

                if (index == 0) {
                    index += 1
                    ancestorCopy.push(valueData)
                    pathData.push(ancestorCopy)
                } else if (onlyParentValue) {
                    pathData.push([onlyParentValue, valueData])
                } else {
                    pathData.push([valueData])
                }
            }
        }
    }
    for (const treePaths of treePath) {
        if (treePaths.type === "moveData") {
            printTreeData(treePaths.data, [])
        } else if (treePaths.type === "nameSample") {
            data.push([{ type: "other", key: treePaths.data.key, primitive: treePaths.data.primitive }])
        } else {
            data.push([{ type: "other", key: treePaths.data.key }])
        }
    }
    const mapData = pathData.map((v) =>
        v.map((e) => {
            return { data: e, type: "moveData" }
        })
    ) as totalPathData[][]
    data.push(...mapData)
    return data
}

function movementData(multiPaths: MultiPathData[][]): movObject[] {
    const paths = multiPaths.map((v) => v.map((e) => e.data))
    const data: movObject[] = []
    for (const path of paths) {
        if (path.length > 0) {
            const newMovOb = {
                id: "neuesItem",
                size: 0,
                type: ObjectType.Pedestrian,
                framePos: [],
                startT: 0,
                endT: 0,
                direction: [0, 0, 0],
            } as movObject
            for (const pathItems of path) {
                newMovOb.id = pathItems.name
                if (newMovOb.framePos.length == 0) {
                    newMovOb.type = pathItems.type
                    newMovOb.startT = (pathItems.time ?? 0) * standardTime
                    newMovOb.endT = (path[path.length - 1].time ?? 1) * standardTime
                    newMovOb.direction = pathItems.direction ?? [0, 0, 0]
                    newMovOb.framePos.push({
                        position: pathItems.position ?? [0, 0, 0],
                        time: pathItems.time * standardTime,
                        direction: pathItems.direction ?? [0, 0, 0],
                    })
                    //console.log(newMovOb.framePos)
                } else {
                    const lastPos = newMovOb.framePos[newMovOb.framePos.length - 1]
                    const newPos = pathItems.position ?? [0, 0, 0]
                    const newTimeSteps = returnNewTimeSteps(
                        lastPos.position ? new Vector3(...lastPos.position) : new Vector3(0, 0, 0),
                        new Vector3(...newPos),
                        pathItems.direction ? new Vector3(...pathItems.direction) : new Vector3(0, 0, 0),
                        lastPos.time,
                        pathItems.time * standardTime
                    )
                    newMovOb.framePos.push(...newTimeSteps)
                }
            }
            data.push(newMovOb)
        }
    }
    return data
}

function returnNewTimeSteps(
    oldPo: Vector3,
    newPo: Vector3,
    direction: Vector3,
    start: number,
    end: number
): framePositions[] {
    const missingPos: framePositions[] = []
    const oldVec = oldPo
    const newVec = newPo
    const diffVec = newVec.sub(oldVec)
    const oldTime = start
    const diffTime = end - start
    for (let i = 1; i < diffTime + 1; i++) {
        const addVec = diffVec.clone().multiplyScalar(i / diffTime)
        missingPos.push({
            time: oldTime + i,
            position: oldVec.clone().add(addVec).toArray(),
            direction: direction.clone().toArray(),
        } as framePositions)
    }
    return missingPos
}
