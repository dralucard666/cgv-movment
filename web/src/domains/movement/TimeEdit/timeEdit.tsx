import { useEffect } from "react"
import { useBaseGlobal, useBaseStore, useBaseStoreState } from "../../../global"
import { useTimeEditStore } from "./useTimeEditStore"

export function TimeEdit() {
    const showTimEdit = useBaseStoreState((state) => state.showTe)
    const rowNumber = useTimeEditStore((state) => state.rowNumber)
    const columnNumber = useTimeEditStore((state) => state.columnNumber)

    const HeaderColumn = (props: { time: number }) => {
        return (
            <div
                style={{
                    height: "30px",
                    width: "800px",
                    backgroundColor: "grey",
                    display: "inline-table",
                    border: "1px outset #202024",
                }}
                className="text-center">
                Time: {props.time}
            </div>
        )
    }

    const HeaderRow = () => {
        const rowArray = Array.from(Array(columnNumber + 2).keys())
        return (
            <>
                <div
                    style={{
                        height: "30px",
                        width: "100px",
                        backgroundColor: "grey",
                        display: "inline-table",
                        border: "1px outset #202024",
                        marginTop: "30px",
                    }}>
                    //
                </div>
                {rowArray.map((i) => {
                    return <HeaderColumn key={i} time={i} />
                })}
            </>
        )
    }

    const Column = (props: { time: number }) => {
        return (
            <div
                style={{
                    height: "190px",
                    width: "800px",
                    backgroundColor: "#001c3d",
                    color: "white",
                    display: "inline-table",
                    top: "0",
                    bottom: "0",
                    left: "0",
                    right: "0",
                    borderRight: "3px outset #202024",
                }}
                className="text-center">
                <div
                    style={{
                        position: "relative",
                        inset: "80px 0 0 0",
                    }}
                    className="d-flex justify-content-center">
                    <button type="button" className="btn btn-primary">
                        Add new Rule
                    </button>
                </div>
            </div>
        )
    }

    const Row = () => {
        const rowArray = Array.from(Array(columnNumber).keys())
        return (
            <div>
                <div
                    style={{
                        height: "200px",
                        width: "100px",
                        backgroundColor: "grey",
                        display: "inline-block",
                        border: "1px outset #202024",
                    }}>
                    <AddColumnButton />
                </div>
                {rowArray.map((i) => {
                    return <Column key={i} time={i} />
                })}
                <div
                    style={{
                        height: "200px",
                        width: "800px",
                        backgroundColor: "#001c3d",
                        display: "inline-table",
                        border: "1px outset #202024",
                    }}>
                    <AddColumnButton />
                </div>
            </div>
        )
    }

    const AddColumnButton = () => {
        const addColumn = useTimeEditStore((state) => state.addColumnNumber)
        return (
            <div
                style={{
                    position: "relative",
                    inset: "80px 0 0 0",
                }}
                className="d-flex justify-content-center">
                <button type="button" className="btn btn-primary" onClick={() => addColumn(1)}>
                    +
                </button>
            </div>
        )
    }

    const EditTools = () => {
        const addRow = useTimeEditStore((state) => state.addRowNumber)
        return (
            <div
                style={{
                    width: "200%",
                    height: "30px",
                    display: "block",
                    position: "fixed",
                    backgroundColor: "#202024",
                    zIndex: "10",
                    marginTop: "-10",
                }}>
                <button onClick={() => addRow(1)}>addRow</button>
            </div>
        )
    }

    const { Viewer } = useBaseGlobal()
    return (
        <div
            className="overflow-hidden position-absolute noselect"
            style={{ top: 0, right: 0, left: 0, bottom: 0, width: "100%", height: "100%" }}>
            <Viewer
                style={{
                    whiteSpace: "pre-line",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    height: "60%",
                }}
                className="flex-basis-0 flex-grow-1 bg-white"
            />
            <>
                <EditTools />
                <div className="table-scroll" style={{ height: "40%" }}>
                    <HeaderRow />
                    {Array.from(Array(rowNumber).keys()).map((v) => {
                        return <Row key={v} />
                    })}
                </div>
            </>
        </div>
    )
}
