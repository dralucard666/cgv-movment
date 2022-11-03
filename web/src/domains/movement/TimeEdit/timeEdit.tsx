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
import { ObjectType, Primitive, standardTime } from "cgv/domains/movement"
import { useEffect, useState } from "react"
import { useBaseGlobal, useBaseStore, useBaseStoreState } from "../../../global"
import {
    framePositions,
    movObject,
    MultiPathData,
    SinglePathData,
    totalPathData,
    useMovementStore,
} from "../useMovementStore"
import { frameData, initRowNumber, pathData, PathNode, useTimeEditStore } from "./useTimeEditStore"
import { AbstractParsedParallel } from "cgv/parser"
import { Slider } from "@mui/material"
import { requestAdd, requestReplace } from "../../../gui"
import { DeleteIcon } from "../../../icons/delete"
import { ForewardIcon } from "../../../icons/forward"
import { BackwardIcon } from "../../../icons/backward"
import classNames from "classnames"

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

    const nextStep = () => {
        useMovementStore.getState().setPlayActive(false)
        const currentTime = useMovementStore.getState().time
        useMovementStore.getState().setTime(currentTime + standardTime - (currentTime % standardTime))
    }

    const previousStep = () => {
        useMovementStore.getState().setPlayActive(false)
        const currentTime = useMovementStore.getState().time
        useMovementStore
            .getState()
            .setTime(currentTime - standardTime > 0 ? currentTime - standardTime + (currentTime % standardTime) : 0)
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
                    className="btn btn-warning">
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
                <span style={{ width: "60px" }}></span>
                <button
                    className="ml-5"
                    style={{ width: "100px", height: "30px", backgroundColor: "white", borderColor: "#202024" }}
                    onClick={previousStep}>
                    <BackwardIcon />
                </button>
                <button
                    style={{ width: "100px", height: "30px", backgroundColor: "white", borderColor: "#202024" }}
                    onClick={nextStep}>
                    <ForewardIcon />
                </button>
            </div>
        </div>
    )
}

const HeaderColumn = (props: { time: number }) => {
    const columnWidth = useTimeEditStore((e) => e.columnWidth)
    const [isSelected, setIsSelected] = useState(false)
    useMovementStore.subscribe((state: { time: number }) => updateTime(state.time))

    const updateTime = (stateTime: number) => {
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

    const setTime = () => {
        useMovementStore.getState().setPlayActive(false)
        useMovementStore.getState().setTime(props.time * standardTime)
    }

    return (
        <div
            onClick={setTime}
            style={{
                backgroundColor: isSelected ? "#bf5f4e" : "grey",
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

function Column(props: { time: number; data?: pathData; showArrow: boolean }) {
    const data = props.data
    const store = useBaseStore()
    const initTime = useMovementStore.getState().time
    const [isSelected, setIsSelected] = useState(
        props.time * standardTime <= initTime && initTime < (props.time + 1) * standardTime
    )
    useMovementStore.subscribe((state) => updateTime(state.time))
    const columnWidth = useTimeEditStore((e) => e.columnWidth)

    const updateTime = (stateTime: number) => {
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
        if (data && data?.operation) {
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

    const setTime = () => {
        useMovementStore.getState().setPlayActive(false)
        useMovementStore.getState().setTime(props.time * standardTime)
    }

    const addCommand = (type: "parallel" | "before" | "after") => {
        if (data && data?.operation) {
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
            requestAdd(store, type)
        }
    }

    const replace = () => {
        if (data && data?.operation) {
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
            requestReplace(store)
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
            }}
            onClick={setTime}>
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
                                        : columnWidth > 0.3
                                        ? "50%"
                                        : "10%",
                                position: "absolute",
                            }}>
                            <div className="row">
                                <div className="container" onClick={selectRule}>
                                    {columnWidth > 0.1
                                        ? ObjectText(data.type, data.position ?? [0, 0, 0], data.direction ?? [0, 0, 0])
                                        : null}
                                </div>
                                {columnWidth > 0.4 ? (
                                    <>
                                        <button
                                            type="button"
                                            style={{
                                                width: columnWidth > 0.5 ? "100px" : "70px",
                                                height: "40px",
                                                marginTop: "10px",
                                                marginRight: 5,
                                            }}
                                            onClick={() => addCommand("parallel")}
                                            className={classNames({
                                                btn: true,
                                                "btn-secondary": true,
                                                "btn-sm": columnWidth < 0.6,
                                            })}>
                                            +Parallel
                                        </button>
                                        <button
                                            type="button"
                                            style={{
                                                width: columnWidth > 0.5 ? "70px" : "50px",
                                                height: "40px",
                                                marginTop: "10px",
                                                marginRight: 5,
                                            }}
                                            onClick={() => addCommand("after")}
                                            className={classNames({
                                                btn: true,
                                                "btn-secondary": true,
                                                "btn-sm": columnWidth < 0.6,
                                            })}>
                                            +After
                                        </button>
                                        <button
                                            type="button"
                                            style={{
                                                width: columnWidth > 0.5 ? "100px" : "70px",
                                                height: "40px",
                                                marginTop: "10px",
                                            }}
                                            onClick={replace}
                                            className={classNames({
                                                btn: true,
                                                "btn-secondary": true,
                                                "btn-sm": columnWidth < 0.6,
                                            })}>
                                            +Replace
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        </div>
                        {data.operation && columnWidth > 0.3 && props.showArrow ? (
                            <div
                                style={{
                                    position: "absolute",
                                    zIndex: 20,
                                    marginLeft: -30,
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

function Row(props: { key: number; data?: totalPathData[] }) {
    const columnNumber = useTimeEditStore((state) => state.columnNumber)
    const setColumnNumber = useTimeEditStore((state) => state.setColumnNumber)
    const store = useBaseStore()
    let moveData = null
    let startT = 0
    let endT = 0
    if (props.data) {
        if (props.data[0].type === "moveData") {
            const dataSave = props.data as MultiPathData[]
            moveData = dataSave.map((v) => {
                return v.data
            })
            console.log(moveData)
            startT = moveData ? moveData[0].time ?? 0 : 0
            endT = moveData ? moveData[moveData.length - 1].time ?? 1 : 0
        }
    }
    if (endT > columnNumber) {
        setColumnNumber(endT + 1)
    }

    const selectRule = (descriptionName: string, primitive?: Primitive) => {
        useMovementStore.getState().setTime(0)
        if (primitive && primitive.grammarSteps.length > 0) {
            if (primitive.grammarSteps[0].type === "operation") {
                store.getState().select(
                    {
                        path: primitive.grammarSteps[0].path,
                        type: "operation",
                        identifier: primitive.grammarSteps[0].identifier,
                        children: primitive.grammarSteps[0].children,
                    } as SelectedSteps,
                    undefined,
                    "replace"
                )
            }
        } else {
            store.getState().selectDescription(descriptionName, store.getState().shift ?? false)
        }
    }

    const addCommand = (type: "parallel" | "before" | "after", descriptionName: string, primitive?: Primitive) => {
        if (primitive && primitive.grammarSteps.length > 0) {
            if (primitive.grammarSteps[0].type === "operation") {
                store.getState().select(
                    {
                        path: primitive.grammarSteps[0].path,
                        type: "operation",
                        identifier: primitive.grammarSteps[0].identifier,
                        children: primitive.grammarSteps[0].children,
                    } as SelectedSteps,
                    undefined,
                    "replace"
                )
                requestAdd(store, type)
            }
        } else {
            store.getState().selectDescription(descriptionName, store.getState().shift ?? false)
            requestAdd(store, type)
        }
    }

    const addDescription = () => {
        store.getState().request(
            "create-description",
            (name) => store.getState().addDescriptions([{ name }]),
            () => ({})
        )
    }

    const DescriptionName = () => {
        if (!props.data) {
            return (
                <button type="button" onClick={addDescription} className="btn btn-secondary">
                    <div>Add</div>
                    <div>Description</div>
                </button>
            )
        } else if (props.data[0].type === "moveData") {
            const data = props.data as MultiPathData[]
            const nameOfPath = data[data.length - 1].data.name.replace("Start@", "")
            const descriptionName = nameOfPath.split("_")[0]
            return (
                <div>
                    <div
                        onClick={() =>
                            store.getState().selectDescription(descriptionName, store.getState().shift ?? false)
                        }>
                        {nameOfPath}
                    </div>
                    <div>
                        <button
                            type="button"
                            style={{ width: "70px", height: "40px", marginTop: "10px" }}
                            onClick={() => addCommand("after", descriptionName, undefined)}
                            className="btn btn-secondary">
                            +After
                        </button>
                    </div>
                    <div className="mt-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                store.getState().deleteDescription(descriptionName)
                                const oldTreePath = useMovementStore
                                    .getState()
                                    .treePath.filter((v) => !v.data.key.includes(descriptionName))
                                useMovementStore.getState().setTreePath(oldTreePath)
                            }}
                            style={{
                                backgroundColor: "white",
                                border: "2px solid black",
                            }}
                            className={`btn text-danger btn-sm`}>
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
            )
        } else if (props.data[0].type === "other") {
            const data = props.data as SinglePathData[]
            const descriptionName = data[0].key.replace("Start@", "").split("_")[0]
            if (data[0].primitive?.startPosition) {
                return (
                    <div onClick={() => selectRule(descriptionName, data[0].primitive)}>
                        <div>{data[0].key.replace("Start@", "")}</div>
                        <div> Position:</div>
                        <div>
                            {data[0].primitive.startPosition
                                .toArray()
                                .map((v) => Math.round(v))
                                .toString()}
                        </div>
                        <div>
                            <button
                                type="button"
                                style={{ width: "70px", height: "40px", marginTop: "10px" }}
                                onClick={() => addCommand("after", descriptionName, data[0].primitive)}
                                className="btn btn-secondary">
                                +After
                            </button>
                        </div>
                        <div className="mt-2">
                            <button
                                style={{
                                    backgroundColor: "white",
                                    border: "2px solid black",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    store.getState().deleteDescription(descriptionName)
                                    const oldTreePath = useMovementStore
                                        .getState()
                                        .treePath.filter((v) => !v.data.key.includes(descriptionName))
                                    useMovementStore.getState().setTreePath(oldTreePath)
                                }}
                                className={`btn text-danger btn-sm`}>
                                <DeleteIcon />
                            </button>
                        </div>
                    </div>
                )
            }
            return <span>{data[0].key}</span>
        } else {
            return (
                <button
                    type="button"
                    style={{ width: "70px", height: "40px", marginTop: "10px" }}
                    onClick={addDescription}
                    className="btn btn-secondary">
                    Add Description
                </button>
            )
        }
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
                    <div style={{ position: "absolute", paddingTop: 30, paddingLeft: 20 }}>
                        <DescriptionName />
                    </div>
                </div>
            </div>
            {moveData ? (
                <>
                    {Array.from(Array(startT).keys()).map((i) => {
                        return <Column key={i} time={i} showArrow={false} />
                    })}
                    {moveData.map((v, i) => {
                        return (
                            <Column
                                key={i + startT}
                                time={i + startT}
                                data={v}
                                showArrow={i != 0 || !!v.operation?.name.includes("create")}
                            />
                        )
                    })}
                    {Array.from(Array(columnNumber - endT).keys()).map((i) => {
                        return <Column key={i + endT + 1} time={i + endT + 1} showArrow={false} />
                    })}
                </>
            ) : (
                Array.from(Array(columnNumber + 1).keys()).map((i) => {
                    return <Column key={i} time={i} showArrow={false} />
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
