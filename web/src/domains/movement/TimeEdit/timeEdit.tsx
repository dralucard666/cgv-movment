import { standardTime } from "cgv/domains/movement"
import { useMovementStore } from "../useMovementStore"
import { useTimeEditStore } from "./useTimeEditStore"
import { Slider } from "@mui/material"
import { ForewardIcon } from "../../../icons/forward"
import { BackwardIcon } from "../../../icons/backward"
import { Row } from "./row"
import { HeaderRow } from "./header"

export function TimeEdit() {
    const data = useMovementStore((state) => state.rowData)
    const setRowNumber = useTimeEditStore((state) => state.setRowNumber)
    if (data.length > useTimeEditStore.getState().rowNumber) {
        setRowNumber(data.length)
    }
    const rowNumber = useTimeEditStore((state) => state.rowNumber)
    return (
        <>
            <div style={{ height: "13%" }}>
                <EditTools />
            </div>
            <div style={{ height: "87%" }}>
                <div
                    style={{
                        overflowX: "auto",
                        overflowY: "auto",
                        whiteSpace: "nowrap",
                        padding: "4 4 4 4",
                        height: "100%",
                    }}>
                    <HeaderRow />
                    {data
                        ? data.map((v, i) => {
                              return <Row key={i} data={v.length > 0 ? v : undefined} />
                          })
                        : null}
                    {rowNumber > data.length
                        ? Array.from(Array(rowNumber - data.length).keys()).map((v) => {
                              return <Row key={v + data.length} />
                          })
                        : null}
                </div>
            </div>
        </>
    )
}

const EditTools = () => {
    const addRow = useTimeEditStore((state) => state.addRowNumber)
    const closeRows = useTimeEditStore((state) => state.setAllRowsClosedToggle)
    const columnWidth = useTimeEditStore((e) => e.columnWidth)

    const handleChange = (event: any, newValue: any) => {
        useTimeEditStore.getState().setColumnWidth(newValue)
    }

    const nextStep = () => {
        useMovementStore.getState().setPlayActive(false)
        const currentTime = useMovementStore.getState().time
        const newVal = currentTime + standardTime - (currentTime % standardTime)
        const maxVal = useMovementStore.getState().maxTime
        useMovementStore.getState().setTime(newVal > maxVal ? maxVal : newVal)
    }

    const previousStep = () => {
        useMovementStore.getState().setPlayActive(false)
        const currentTime = useMovementStore.getState().time
        useMovementStore
            .getState()
            .setTime(
                currentTime - standardTime > 0
                    ? currentTime % standardTime == 0
                        ? currentTime - standardTime
                        : currentTime - (currentTime % standardTime)
                    : 0
            )
    }

    return (
        <div>
            <div
                className="row w-100"
                style={{ position: "absolute", backgroundColor: "#202024", marginTop: 2, marginLeft: 2, zIndex:1 }}>
                <button
                    type="button"
                    style={{ width: "100px", height: "30px" }}
                    onClick={() => addRow(1)}
                    className="btn btn-warning">
                    addRow
                </button>
                <span style={{ width: "200px", color: "red", paddingTop: "5px" }}>
                    Set Column Size: {columnWidth * 100}%
                </span>
                <Slider
                    step={0.1}
                    min={0.2}
                    max={1}
                    value={columnWidth}
                    onChangeCommitted={handleChange}
                    marks
                    sx={{
                        width: 100,
                        color: "#7f0000",
                    }}
                />
                <span style={{ width: "60px" }}></span>
                <button
                    type="button"
                    className="ml-5"
                    style={{ width: "100px", height: "30px", backgroundColor: "white", borderColor: "#202024" }}
                    onClick={previousStep}>
                    <BackwardIcon />
                </button>
                <button
                    type="button"
                    style={{ width: "100px", height: "30px", backgroundColor: "white", borderColor: "#202024" }}
                    onClick={nextStep}>
                    <ForewardIcon />
                </button>
                <span style={{ width: "60px" }}></span>
                <button
                    type="button"
                    style={{ width: "150px", height: "30px" }}
                    onClick={closeRows}
                    className="ml-5 btn btn-warning btn-sm">
                    open/close rows
                </button>
            </div>
        </div>
    )
}
