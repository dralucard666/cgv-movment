import { AbstractParsedSteps, HierarchicalInfo } from "cgv"
import { ObjectType } from "cgv/domains/movement"
import create from "zustand"
import { framePositions } from "../useMovementStore"

export const initRowNumber = 2
export interface TimeEditState {
    treePath: PathNode[]
    columnNumber: number
    setColumnNumber: (length: number) => void
    addColumnNumber: (length: number) => void
    rowNumber: number
    rowData: { descriptionName: string; steps: AbstractParsedSteps<HierarchicalInfo>[] }[]
    setRowNumber: (length: number) => void
    addRowNumber: (length: number) => void
    columnWidth: number
    setColumnWidth: (length: number) => void
}

export type frameData = framePositions & { type: ObjectType; name: string }

export type pathData = frameData & {
    operation?: { name: string; parameter: AbstractParsedSteps<HierarchicalInfo>[] }
    path: [string, ...number[]]
}

export interface PathNode {
    key: any // type for unknown keys.
    children: { [key: string]: PathNode } // type for a known property.
    operation?: { name: string; parameter: AbstractParsedSteps<HierarchicalInfo>[] }
    path: [string, ...number[]]
    framePosition: frameData
}

export const useTimeEditStore = create<TimeEditState>((set, get) => ({
    treePath: [],
    columnNumber: 20,
    setColumnNumber: (length: number) =>
        set((state) => {
            return { columnNumber: length }
        }),
    addColumnNumber: (length: number) =>
        set((state) => {
            return { columnNumber: state.columnNumber + length }
        }),
    rowNumber: initRowNumber,
    rowData: [],
    addRowNumber: (length: number) =>
        set((state) => {
            return { rowNumber: state.rowNumber + length }
        }),
    setRowNumber: (length: number) =>
        set((state) => {
            return { rowNumber: length }
        }),
    columnWidth: 0.6,
    setColumnWidth: (length: number) =>
        set((state) => {
            return { columnWidth: length }
        }),
}))
