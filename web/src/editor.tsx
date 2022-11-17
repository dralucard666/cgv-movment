import { useEffect } from "react"
import { TextEditor, Grammar } from "./tui"
import { useBaseStore, useBaseStoreState } from "./global"
import { useBaseGlobal } from "./global"
import { Dialogs } from "./gui/dialogs"
import { Graph } from "./graph"
import { TimeEdit } from "./domains/movement/TimeEdit/timeEdit"
import classNames from "classnames"
import { CloseIcon } from "./icons/close"
import { useTimeEditStore } from "./domains/movement/TimeEdit/useTimeEditStore"
import { ObjectType } from "cgv/domains/movement"
import { BicycleIcon } from "./icons/bicycle"
import { PersonIcon } from "./icons/person"
import { TruckIcon } from "./icons/truck"

export function Editor() {
    const store = useBaseStore()
    useEffect(() => {
        const keyUpListener = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Shift":
                case "Control":
                    store.getState().setShift(false)
                    break
            }
        }
        const keyDownListener = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    store.getState().escape()
                    break
                case "Delete":
                    if (e.target == document.body) {
                        store.getState().removeStep()
                    }
                    break
                case "Shift":
                case "Control":
                    store.getState().setShift(true)
                    break
            }
        }
        window.addEventListener("keydown", keyDownListener)
        window.addEventListener("keyup", keyUpListener)
        return () => {
            window.removeEventListener("keydown", keyDownListener)
            window.removeEventListener("keyup", keyUpListener)
        }
    }, [store])

    const { Viewer } = useBaseGlobal()
    const showTimEdit = useBaseStoreState((state) => state.showTe)

    return (
        <>
            <div
                //className="overflow-hidden position-absolute noselect"
                className={classNames({
                    "overflow-hidden": true,
                    "position-absolute": true,
                    noselect: true,
                    "d-flex": true,
                    "responsive-flex-direction": true,
                })}
                style={
                    showTimEdit
                        ? { top: 0, right: 0, left: 0, bottom: 0, width: "100%", height: "60%" }
                        : { top: 0, right: 0, left: 0, bottom: 0 }
                }>
                <Dialogs />
                <EditDataModal />
                <Viewer
                    style={{ whiteSpace: "pre-line", top: 0, left: 0, right: 0, bottom: 0 }}
                    className="flex-basis-0 flex-grow-1 bg-white"
                />
                <RightHandSide />
            </div>
            {showTimEdit ? (
                <div
                    className="overflow-hidden position-absolute noselect"
                    style={{ height: "40%", bottom: "0px", width: "100%", backgroundColor: "#202024" }}>
                    <TimeEdit />
                </div>
            ) : null}
        </>
    )
}

function RightHandSide() {
    const Component = useBaseStoreState((state) =>
        !state.showTui ? undefined : state.type === "tui" ? TextEditor : state.graphVisualization ? Graph : Grammar
    )
    const showTimEdit = useBaseStoreState((state) => state.showTe)

    if (Component == null) {
        return null
    }

    return (
        <div className="max-responsive-size-35 scroll text-editor text-light flex-basis-0 flex-grow-1 bg-dark d-flex">
            <Component />
        </div>
    )
}

function EditDataModal() {
    const isOpen = useTimeEditStore((state) => state.modalOpen)
    const modalData = useTimeEditStore((state) => state.modalData)

    return (
        <>
            {isOpen ? (
                <div
                    className="position-absolute d-flex flex-column align-items-center overflow-hidden"
                    style={{ top: 0, right: 0, bottom: 0, left: 0, zIndex: 2, background: "rgba(0,0,0,0.3)" }}>
                    <div
                        style={{ maxWidth: "40rem", margin: "0 auto" }}
                        className="rounded overflow-hidden shadow d-flex flex-column m-3 p-3 w-100 bg-light">
                        {modalData
                            ? ObjectText(
                                  modalData.type,
                                  modalData.position,
                                  modalData.direction ?? [0, 0, 0],
                                  modalData.name
                              )
                            : null}
                        <div className="d-flex flex-row align-items-center justify-content-end">
                            <button
                                className="d-flex align-items-center ms-3 btn btn-sm btn-outline-secondary"
                                onClick={() => useTimeEditStore.getState().setModalOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}

function ObjectText(type: ObjectType | "primitive", position2: number[], direction2: number[], name: string) {
    const position = position2.map((v) => Math.round(v))
    const direction = direction2.map((v) => Math.round(v))

    switch (type) {
        case "primitive":
            return (
                <>
                    <div className="row">
                        <p className="text-center">
                            <h5>{name}</h5>
                        </p>
                    </div>
                    <div className="row mt-3">
                        <div className="col-8">Primitive</div>
                    </div>
                    <div className="row">
                        <div className="col-8">Position: {position.toString()}</div>
                    </div>
                </>
            )
        case ObjectType.Cyclist:
            return (
                <>
                    <div className="row">
                        <p className="text-center">
                            <h5>{name}</h5>
                        </p>
                    </div>
                    <div className="row mt-3">
                        <div className="col-8">Cyclist</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Position: {position.toString()}</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Direction: {direction.toString()}</div>
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-8 d-flex justify-content-center">
                            <BicycleIcon width={100} height={100} />
                        </div>
                    </div>
                </>
            )
        case ObjectType.Pedestrian:
            return (
                <>
                    <div className="row">
                        <p className="text-center">
                            <h5>{name}</h5>
                        </p>
                    </div>
                    <div className="row mt-3">
                        <div className="col-8">Pedestrian</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Position: {position.toString()}</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Direction: {direction.toString()}</div>
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-8 d-flex justify-content-center">
                            <PersonIcon width={100} height={100} />
                        </div>
                    </div>
                </>
            )
        case ObjectType.Car:
            return (
                <>
                    <div className="row">
                        <p className="text-center">
                            <h5>{name}</h5>
                        </p>
                    </div>
                    <div className="row mt-3">
                        <div className="col-8">Car</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Position: {position.toString()}</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Direction: {direction.toString()}</div>
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-8 d-flex justify-content-center">
                            <TruckIcon width={100} height={100} />
                        </div>
                    </div>
                </>
            )
        default:
            return (
                <>
                    <div className="row">
                        <p className="text-center">
                            <h5>{name}</h5>
                        </p>
                    </div>
                    <div className="row mt-3">
                        <div className="col-8">Pedestrian</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Position: {position.toString()}</div>
                    </div>
                    <div className="row mt-1">
                        <div className="col-8">Direction: {direction.toString()}</div>
                    </div>
                    <div className="row justify-content-center mt-4">
                        <div className="col-8 d-flex justify-content-center">
                            <PersonIcon width={100} height={100} />
                        </div>
                    </div>
                </>
            )
    }
}
