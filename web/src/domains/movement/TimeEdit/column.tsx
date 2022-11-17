import { AbstractParsedSteps, HierarchicalInfo, SelectedSteps } from "cgv"
import { standardTime, ObjectType } from "cgv/domains/movement"
import { useState } from "react"
import { useBaseStore } from "../../../global"
import { requestAdd, requestReplace } from "../../../gui"
import { BicycleIcon } from "../../../icons/bicycle"
import { PersonIcon } from "../../../icons/person"
import { TruckIcon } from "../../../icons/truck"
import { pathData, useMovementStore } from "../useMovementStore"
import { useTimeEditStore } from "./useTimeEditStore"

export function Column(props: { time: number; data?: pathData; showArrow: boolean; open: boolean; name?: string }) {
    const data = props.data
    const store = useBaseStore()
    const initTime = useMovementStore.getState().time
    const isOpen = props.open
    const name = props.name ? props.name : ""
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
            store.getState().selectDescription(data.path[0].replace("Start@", ""), store.getState().shift ?? false)
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

    const showModalData = () => {
        if (data && data?.operation) {
            useTimeEditStore.getState().setModalOpen(true)
            useTimeEditStore.getState().setModalData({
                type: data.type,
                position: data.position ?? [0, 0, 0],
                direction: data.direction ?? [0, 0, 0],
                name,
            })
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
                borderLeft: "2px inset #202024",
                borderBottom: "2px inset #202024",
            }}
            onClick={() => {
                selectRule()
                setTime()
            }}>
            <div
                style={{
                    width: columnWidth * 400,
                    height: isOpen ? "80px" : "20px",
                    position: "relative",
                }}>
                {!data || !isOpen ? (
                    <div
                        className="d-flex justify-content-center"
                        style={{ marginTop: "50px", position: "absolute" }}></div>
                ) : (
                    <>
                        {data.operation && columnWidth > 0.4 && props.showArrow ? (
                            <div
                                style={{
                                    marginTop: "25px",
                                    marginLeft:
                                        columnWidth > 0.8
                                            ? "48%"
                                            : columnWidth > 0.7
                                            ? "45%"
                                            : columnWidth > 0.6
                                            ? "42%"
                                            : columnWidth > 0.5
                                            ? "38%"
                                            : columnWidth > 0.4
                                            ? "50%"
                                            : "40%",
                                    position: "absolute",
                                }}>
                                <div className="row">
                                    <div className="container">
                                        <button
                                            onClick={showModalData}
                                            className="d-flex align-items-center justify-content-center btn btn-secondary btn-lg">
                                            {data.type === ObjectType.Cyclist ? (
                                                <BicycleIcon />
                                            ) : data.type === ObjectType.Pedestrian ? (
                                                <PersonIcon />
                                            ) : (
                                                <TruckIcon />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div></div>
                        )}
                        {data.operation && columnWidth > 0.2 && props.showArrow ? (
                            <div
                                style={{
                                    position: "absolute",
                                    zIndex: 20,
                                    marginLeft: columnWidth > 0.5 ? -80 : -40,
                                    marginTop: 25,
                                    width: columnWidth * 200,
                                    fontSize: columnWidth > 0.5 ? "16px" : "12px",
                                    fontWeight: columnWidth > 0.5 ? "400" : "600"
                                }}
                                className="box">
                                {data.operation.name == "moveRotate" ? (
                                    <span className="row">
                                        {data.operation.name}
                                        {"(" +
                                            data.operation.parameter
                                                .map((v) => {
                                                    return v.type === "raw"
                                                        ? v.value
                                                        : childrenArrayToString(v.children)
                                                })
                                                .toString() +
                                            ")"}
                                    </span>
                                ) : (
                                    <span className="row">{data.operation.name}</span>
                                )}
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
