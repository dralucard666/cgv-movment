import {
    AbstractParsedNoun,
    AbstractParsedSteps,
    getLocalDescription,
    HierarchicalInfo,
    HierarchicalPath,
    ParsedSteps,
    SelectedSteps,
    shallowEqual,
} from "cgv"
import { ObjectType, standardTime } from "cgv/domains/movement"
import { useEffect, useState } from "react"
import { useBaseGlobal, useBaseStore, useBaseStoreState } from "../../../global"
import { framePositions, movObject, useMovementStore } from "../useMovementStore"
import { frameData, initRowNumber, pathData, PathNode, useTimeEditStore } from "./useTimeEditStore"
import { AbstractParsedParallel } from "cgv/parser"
import { Slider } from "@mui/material"
import { requestAdd } from "../../../gui"
export function TimeEdit() {
    const data = useMovementStore((state) => state.rowData)
    const setRowNumber = useTimeEditStore((state) => state.setRowNumber)
    if (data.length > useTimeEditStore.getState().rowNumber) {
        setRowNumber(data.length)
    }
    const rowNumber = useTimeEditStore((state) => state.rowNumber)

    return (
        <>
            <div style={{ height: "12%" }}>
                <EditTools />
            </div>
            <div style={{ height: "88%" }}>
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
    const columnWidth = useTimeEditStore((e) => e.columnWidth)

    const handleChange = (event: any, newValue: any) => {
        useTimeEditStore.getState().setColumnWidth(newValue)
    }

    return (
        <div
            style={{
                height: "100%",
                backgroundColor: "#202024",
            }}>
            <div className="row m-2" style={{ position: "absolute" }}>
                <button
                    type="button"
                    style={{ width: "100px", height: "30px" }}
                    onClick={() => addRow(1)}
                    className="btn btn-primary">
                    addRow
                </button>
                <span style={{ width: "200px", color: "red", paddingTop: "5px" }}>
                    Set Column Size: {columnWidth * 100}%
                </span>
                <Slider
                    step={0.1}
                    min={0.1}
                    max={1}
                    value={columnWidth}
                    onChangeCommitted={handleChange}
                    marks
                    sx={{
                        width: 100,
                        color: "#7f0000",
                    }}
                />
            </div>
        </div>
    )
}

const HeaderColumn = (props: { time: number }) => {
    const columnWidth = useTimeEditStore((e) => e.columnWidth)
    return (
        <div
            style={{
                backgroundColor: "grey",
                display: "table-cell",
                borderLeft: "5px inset #202024",
                borderBottom: "5px inset #202024",
            }}
            className="text-center">
            <div style={{ width: columnWidth * 800 }}>Step: {props.time}</div>
        </div>
    )
}

const HeaderRow = () => {
    const columnNumber = useTimeEditStore((state) => state.columnNumber)
    const rowArray = Array.from(Array(columnNumber + 1).keys())
    return (
        <div
            style={{
                height: "30px",
                display: "table-row",
            }}>
            <div
                style={{
                    backgroundColor: "grey",
                    display: "table-cell",
                    borderLeft: "5px inset #202024",
                    borderBottom: "5px inset #202024",
                }}>
                <div style={{ width: "150px" }}>Descriptions</div>
            </div>
            {rowArray.map((i) => {
                return <HeaderColumn key={i} time={i} />
            })}
        </div>
    )
}

const getRawValue = (rawValue: AbstractParsedSteps<HierarchicalInfo> | undefined) => {
    if (!rawValue) {
        return null
    }
    return rawValue.type == "raw" ? rawValue.value : null
}

function Column(props: {
    time: number
    descriptionName?: string | undefined
    data?: pathData
    showAddDescription: boolean
}) {
    const data = props.data
    const store = useBaseStore()
    const initTime = useMovementStore.getState().time
    const [isSelected, setIsSelected] = useState(
        props.time * standardTime <= initTime && initTime < (props.time + 1) * standardTime
    )
    useMovementStore.subscribe((state) => updateTime(state.time))
    const columnWidth = useTimeEditStore((e) => e.columnWidth)

    const updateTime = (stateTime: number) => {
        console.log("hier ist was")
        if (props.time * standardTime <= stateTime && stateTime < (props.time + 1) * standardTime) {
            if (!isSelected) {
                setIsSelected(true)
            }
        } else {
            if (isSelected) {
                setIsSelected(false)
            }
        }
    }

    const addNewRule = () => {
        if (data) {
            // store.getState().select(data.path as SelectedSteps, undefined, "replace")
        }
    }

    const selectRule = () => {
        useMovementStore.getState().setTime(props.time * standardTime)
        console.log("selectRule")
        console.log(data?.operation)
        if (data && data?.operation) {
            console.log("kommen hier rein")
            store.getState().select(
                {
                    path: data.path,
                    type: "operation",
                    identifier: data.operation.name,
                    children: data.operation.parameter,
                } as SelectedSteps,
                undefined,
                "replace"
            )
        }
    }

    const addAfter = () => {
        if (data && data?.operation) {
            console.log("kommen hier rein")
            store.getState().select(
                {
                    path: data.path,
                    type: "operation",
                    identifier: data.operation.name,
                    children: data.operation.parameter,
                } as SelectedSteps,
                undefined,
                "replace"
            )
            requestAdd(store, "after")
        }
    }

    return (
        <div
            style={{
                backgroundColor: isSelected ? "#bf5f4e" : "#001c3d",
                color: "white",
                display: "table-cell",
                borderLeft: "5px inset #202024",
                borderBottom: "5px inset #202024",
            }}>
            <div
                style={{
                    width: columnWidth * 800,
                    height: "200px",
                    position: "relative",
                }}>
                {!data ? (
                    <div
                        className="d-flex justify-content-center"
                        style={{ marginTop: "50px", position: "absolute" }}></div>
                ) : (
                    <>
                        <div
                            style={{
                                marginTop: "50px",
                                marginLeft:
                                    columnWidth > 0.5
                                        ? "40%"
                                        : columnWidth > 0.4
                                        ? "50%"
                                        : columnWidth > 0.2
                                        ? "50%"
                                        : "20%",
                                position: "absolute",
                            }}
                            onClick={selectRule}>
                            <div className="row">
                                <div className="container" onClick={selectRule}>
                                    {columnWidth > 0.1
                                        ? ObjectText(data.type, data.position ?? [0, 0, 0], data.direction ?? [0, 0, 0])
                                        : null}
                                </div>
                                <button
                                    type="button"
                                    style={{ width: "70px", height: "40px", marginTop: "10px" }}
                                    onClick={addAfter}
                                    className="btn btn-secondary">
                                    +After
                                </button>
                            </div>
                        </div>
                        {data.operation && columnWidth > 0.3 ? (
                            <div
                                style={{
                                    position: "absolute",
                                    zIndex: 20,
                                    marginLeft: -20,
                                    marginTop: 70,
                                    width: columnWidth * 200,
                                    fontSize: columnWidth > 0.6 ? "20px" : "16px",
                                }}
                                onClick={selectRule}
                                className="box">
                                <span className="row">{columnWidth > 0.2 ? data.operation.name : ""}</span>
                                {/*                                 {data.operation.parameter.map((v) => {
                                    return (
                                        <span className="row">
                                            {v.type === "raw" ? v.value : childrenArrayToString(v.children)}
                                        </span>
                                    )
                                })} */}
                            </div>
                        ) : (
                            <div></div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

function childrenArrayToString(children: AbstractParsedSteps<HierarchicalInfo>[] | undefined): string {
    if (!children) {
        return ""
    }
    return children.map((c) => (c.type === "raw" ? c.value : "")).toString()
}

function Row(props: { key: number; data?: pathData[] }) {
    const data = props.data
    const descriptionName = data ? data[0].name.replace('Start@','') : undefined
    const startT = data ? data[0].time ?? 0 : 0
    const endT = data ? data[data.length - 1].time ?? 1 : 0
    const columnNumber = useTimeEditStore((state) => state.columnNumber)
    const setColumnNumber = useTimeEditStore((state) => state.setColumnNumber)
    if (endT > columnNumber) {
        setColumnNumber(endT + 1)
    }

    return (
        <div>
            <div
                style={{
                    backgroundColor: "grey",
                    display: "table-cell",
                    borderLeft: "5px inset #202024",
                    borderBottom: "5px inset #202024",
                }}>
                <div style={{ position: "relative", height: "200px", width: "150px" }}>
                    <div style={{ position: "absolute", paddingTop: 90, paddingLeft: 20 }}>
                        {descriptionName ? descriptionName : "add Description"}
                    </div>
                </div>
            </div>
            {data ? (
                <>
                    {Array.from(Array(startT).keys()).map((i) => {
                        return <Column key={i} time={i} showAddDescription={false} />
                    })}
                    {data.map((v, i) => {
                        return <Column key={i + startT} time={i + startT} data={v} showAddDescription={false} />
                    })}
                    {Array.from(Array(columnNumber - endT).keys()).map((i) => {
                        return (
                            <Column
                                descriptionName={descriptionName}
                                key={i + endT + 1}
                                time={i + endT + 1}
                                showAddDescription={true}
                            />
                        )
                    })}
                </>
            ) : (
                Array.from(Array(columnNumber + 1).keys()).map((i) => {
                    return <Column key={i} time={i} showAddDescription={true} />
                })
            )}
        </div>
    )
}

function ObjectText(type: ObjectType, position2: number[], direction2: number[]) {
    const position = position2.map((v) => Math.round(v))
    const direction = direction2.map((v) => Math.round(v))

    switch (type) {
        case ObjectType.Cyclist:
            return (
                <>
                    <span className="row">Cyclist</span>
                    <span className="row">Position: {position.toString()}</span>
                    <span className="row">Direction: {direction.toString()}</span>
                </>
            )
        case ObjectType.Pedestrian:
            return (
                <>
                    <span className="row">Pedestrian</span>
                    <span className="row">Position: {position.toString()}</span>
                    <span className="row">Direction: {direction.toString()}</span>
                </>
            )
        case ObjectType.Car:
            return (
                <>
                    <span className="row">Car</span>
                    <span className="row">Position: {position.toString()}</span>
                    <span className="row">Direction: {direction.toString()}</span>
                </>
            )
        default:
            return (
                <>
                    <span className="row">Pedestrian</span>
                    <span className="row">Position: {position.toString()}</span>
                    <span className="row">Direction: {direction.toString()}</span>
                </>
            )
    }
}
