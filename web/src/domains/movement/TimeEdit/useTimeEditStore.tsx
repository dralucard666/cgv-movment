import create from "zustand"

export interface TimeEditState {
    columnNumber: number
    setColumnNumber: (length: number) => void
    addColumnNumber: (length: number) => void
    rowNumber: number
    setRowNumber: (length: number) => void
    addRowNumber: (length: number) => void
}

export const useTimeEditStore = create<TimeEditState>((set, get) => ({
    columnNumber: 5,
    setColumnNumber: (length: number) =>
        set((state) => {
            return { columnNumber: length }
        }),
    addColumnNumber: (length: number) =>
        set((state) => {
            return { columnNumber: state.columnNumber + length }
        }),
    rowNumber: 1,
    addRowNumber: (length: number) =>
        set((state) => {
            return { rowNumber: state.rowNumber + length }
        }),
    setRowNumber: (length: number) =>
        set((state) => {
            return { rowNumber: length }
        }),
}))
