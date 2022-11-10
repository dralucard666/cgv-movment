import { SelectedSteps } from "cgv"
import { Primitive } from "cgv/domains/movement"
import { useState } from "react"
import shallow from "zustand/shallow"
import { useBaseStore } from "../../../global"
import { requestAdd } from "../../../gui"
import { CaretDownFill } from "../../../icons/caret-down-fill"
import { CaretUpFill } from "../../../icons/caret-up-fill"
import { DeleteIcon } from "../../../icons/delete"
import { PersonIcon } from "../../../icons/person"
import { totalPathData, MultiPathData, useMovementStore, SinglePathData } from "../useMovementStore"
import { Column } from "./column"
import { useTimeEditStore } from "./useTimeEditStore"

export function Row(props: { key: number; data?: totalPathData[] }) {
    const columnNumber = useTimeEditStore((state) => state.columnNumber)
    const setColumnNumber = useTimeEditStore((state) => state.setColumnNumber)

    const store = useBaseStore()
    const [isOpen, setIsOpen] = useState(true)
    useTimeEditStore.subscribe(
        (state: { allRowsClosedToggle: boolean }) => state.allRowsClosedToggle,
        (allRowsClosedToggle) => setIsOpen(allRowsClosedToggle),
        { equalityFn: shallow }
    )
    const [nameOfRow, setNameOfRow] = useState(
        props.data
            ? props.data[0].type === "moveData"
                ? (props.data as MultiPathData[])[props.data.length - 1].data.name.replace("Start@", "")
                : (props.data as SinglePathData[])[0].key.replace("Start@", "")
            : ""
    )

    let moveData = null
    let startT = 0
    let endT = 0
    if (props.data) {
        if (props.data[0].type === "moveData") {
            const dataSave = props.data as MultiPathData[]
            moveData = dataSave.map((v) => {
                return v.data
            })
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

    const showModalData = () => {
        if (props?.data && props.data[0].type == "other") {
            if (props.data[0].primitive?.startPosition) {
                useTimeEditStore.getState().setModalOpen(true)
                useTimeEditStore.getState().setModalData({
                    type: "primitive",
                    position: props.data[0].primitive?.startPosition.toArray(),
                    direction: undefined,
                    name: nameOfRow,
                })
            }
        }
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
            const nameOfPath = nameOfRow
            const descriptionName = nameOfPath.split("_")[0]
            return (
                <div>
                    <div
                        onClick={() =>
                            store.getState().selectDescription(descriptionName, store.getState().shift ?? false)
                        }
                        className="text-truncate">
                        {nameOfPath}
                    </div>
                    <div className="mt-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                store.getState().deleteDescription(descriptionName)
                            }}
                            style={{
                                backgroundColor: "white",
                            }}
                            className={`btn text-danger btn-sm`}>
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
            )
        } else if (props.data[0].type === "other") {
            const data = props.data as SinglePathData[]
            const descriptionName = nameOfRow.split("_")[0]
            if (data[0].primitive?.startPosition) {
                return (
                    <div onClick={() => selectRule(descriptionName, data[0].primitive)}>
                        <div className="text-truncate">{nameOfRow}</div>
                        <div className="row mt-2">
                            <div className="col-3">
                                <button
                                    onClick={showModalData}
                                    className="d-flex align-items-center justify-content-center btn btn-secondary">
                                    <PersonIcon />
                                </button>
                            </div>
                            <div className="col-3">
                                <button
                                    style={{
                                        backgroundColor: "white",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        store.getState().deleteDescription(descriptionName)
                                    }}
                                    className={`btn text-danger btn-sm`}>
                                    <DeleteIcon />
                                </button>
                            </div>
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
            {isOpen ? (
                <div
                    style={{
                        backgroundColor: "grey",
                        display: "table-cell",
                        borderLeft: "2px inset #202024",
                        borderBottom: "2px inset #202024",
                    }}>
                    <div style={{ position: "relative", height: "80px", width: "200px" }}>
                        <div style={{ position: "absolute", paddingTop: 10, paddingLeft: 20, width: "100%" }}>
                            <DescriptionName />
                        </div>
                        <button
                            style={{
                                position: "absolute",
                                height: "20px",
                                width: "20px",
                                marginLeft: "85%",
                                marginTop: 55,
                                backgroundColor: "grey",
                                border: "none",
                            }}
                            onClick={() => setIsOpen((old) => !old)}>
                            <CaretUpFill />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        backgroundColor: "grey",
                        display: "table-cell",
                        borderLeft: "2px inset #202024",
                        borderBottom: "2px inset #202024",
                    }}>
                    <div
                        style={{ position: "relative", height: "20px", width: "200px" }}
                        onClick={() => setIsOpen((old) => !old)}>
                        <div
                            style={{
                                position: "absolute",
                                height: "20px",
                                marginLeft: 10,
                            }}>
                            <>
                                <div>
                                    <span style={{ position: "absolute", width: 150 }} className="text-truncate">
                                        {nameOfRow}
                                    </span>
                                    <span style={{ marginLeft: 164 }}>
                                        <CaretDownFill />
                                    </span>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            )}
            {moveData ? (
                <>
                    {Array.from(Array(startT).keys()).map((i) => {
                        return <Column key={i} time={i} showArrow={false} open={isOpen} />
                    })}
                    {moveData.map((v, i) => {
                        return (
                            <Column
                                key={i + startT}
                                time={i + startT}
                                data={v}
                                showArrow={
                                    i != 0 ||
                                    !!v.operation?.name.includes("create") ||
                                    !!v.operation?.name.includes("cyclist") ||
                                    !!v.operation?.name.includes("pedestrian") ||
                                    !!v.operation?.name.includes("car")
                                }
                                open={isOpen}
                                name={nameOfRow}
                            />
                        )
                    })}
                    {Array.from(Array(columnNumber - endT).keys()).map((i) => {
                        return <Column key={i + endT + 1} time={i + endT + 1} showArrow={false} open={isOpen} />
                    })}
                </>
            ) : (
                Array.from(Array(columnNumber + 1).keys()).map((i) => {
                    return <Column key={i} time={i} showArrow={false} open={isOpen} />
                })
            )}
        </div>
    )
}
