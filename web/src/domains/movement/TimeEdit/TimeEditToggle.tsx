import Tooltip from "rc-tooltip"
import { HTMLProps } from "react"
import { useBaseStore } from "../../../global"
import { FilmEditIcon } from "../../../icons/film-edit"

export function TimeEditToggle({ className, ...rest }: HTMLProps<HTMLDivElement>) {
    const store = useBaseStore()
    const showTe = store((state) => state.showTe)
    return (
        <Tooltip placement="left" overlay="Time Edit Toggle">
            <div
                {...rest}
                onClick={() => store.getState().setShowTe(!showTe)}
                className={`${className} d-flex align-items-center justify-content-center btn ${
                    showTe ? "btn-primary" : "btn-secondary"
                } btn-sm `}>
                <FilmEditIcon />
            </div>
        </Tooltip>
    )
}
