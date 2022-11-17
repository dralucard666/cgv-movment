import Tooltip from "rc-tooltip"
import { HTMLProps } from "react"
import { useBaseStore } from "../global"
import { DeleteIcon } from "../icons/delete"
import { FileCheckIcon } from "../icons/file-check"
import { PlusIcon } from "../icons/plus"
import { RandomIcon } from "../icons/random"

export function DescriptionList({
    createDescriptionRequestData,
    style,
    className,
    children,
    ...rest
}: HTMLProps<HTMLDivElement> & { createDescriptionRequestData?: () => any }) {
    const store = useBaseStore()
    const descriptions = store((state) => state.descriptions.filter((v) => v.domain === state.domain))
    const selectedDescriptions = store((state) => state.selectedDescriptions)
    return (
        <div
            {...rest}
            style={style}
            className={`${className} bg-light rounded shadow w-100 overflow-hidden border d-flex flex-column`}>
            <div className="p-2 border-top border-1">
                <button onClick={() => store.getState().toggleDomain()} className={`btn text-primary btn-sm`}>
                    {store.getState().domain}
                </button>
            </div>
            <div className="px-3 py-2 border-bottom d-flex flex-row align-items-center">
                <span>Descriptions</span>
                <div className="flex-grow-1" />
                <Tooltip align={{ offset: [0, 8] }} placement="top" overlay="Add Description">
                    <button
                        onClick={() =>
                            store
                                .getState()
                                .request(
                                    "create-description",
                                    (name) => store.getState().addDescriptions([{ name }]),
                                    createDescriptionRequestData == null ? undefined : createDescriptionRequestData()
                                )
                        }
                        className={`btn text-primary btn-sm`}>
                        <PlusIcon />
                    </button>
                </Tooltip>
            </div>
            <div className="d-flex flex-column scroll">
                {descriptions.map(({ name, seed }, i) => (
                    <div
                        onClick={(e) => store.getState().selectDescription(name, store.getState().shift ?? false)}
                        key={name}
                        className={`pointer py-2 ps-3 pe-2 d-flex flex-row align-items-center border-top border-1 ${
                            selectedDescriptions.includes(name) ? "border-primary border-3 border" : ""
                        }`}>
                        <span className="overflow-hidden" style={{ textOverflow: "ellipsis" }}>
                            {name}
                        </span>
                        <div className="flex-grow-1" />

                        <Tooltip align={{ offset: [0, 5] }} placement="top" overlay="Concretize">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    store.getState().concretizeDescription(name, seed)
                                }}
                                className={`btn btn-sm`}>
                                <FileCheckIcon />
                            </button>
                        </Tooltip>

                        <Tooltip placement="top" align={{ offset: [0, 5] }} overlay="Randomize">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    store.getState().setSeed(name, seed + 1)
                                }}
                                className={`btn btn-sm`}>
                                <RandomIcon />
                            </button>
                        </Tooltip>

                        <Tooltip placement="top" align={{ offset: [0, 5] }} overlay="Delete Description">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    store.getState().deleteDescription(name)
                                }}
                                className={`btn text-danger btn-sm`}>
                                <DeleteIcon />
                            </button>
                        </Tooltip>
                    </div>
                ))}
            </div>
            {children}
        </div>
    )
}
