import { standardTime } from "cgv/domains/movement"
import { useState } from "react"
import { useMovementStore } from "../useMovementStore"
import { useTimeEditStore } from "./useTimeEditStore"

export const HeaderColumn = (props: { time: number }) => {
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
                borderLeft: "2px inset #202024",
                borderBottom: "2px inset #202024",
            }}
            className="text-center">
            <div style={{ width: columnWidth * 400 }}>Step: {props.time}</div>
        </div>
    )
}

export const HeaderRow = () => {
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
                    borderLeft: "2px inset #202024",
                    borderBottom: "2px inset #202024",
                }}>
                <div style={{ width: "200px" }}>Descriptions</div>
            </div>
            {rowArray.map((i) => {
                return <HeaderColumn key={i} time={i} />
            })}
        </div>
    )
}
