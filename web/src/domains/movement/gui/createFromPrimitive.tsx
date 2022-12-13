import { AbstractParsedOperation, HierarchicalInfo, assureType, ParsedSteps } from "cgv"
import { useBaseStore } from "../../../global"
import { BlurInput } from "../../../gui/blur-input"
import { StartLabel } from "../../../gui/label"
import { ObjectTypeInput } from "./objectTypeInput"
import { GUIVector3 } from "./vector"

export function GUICreateFromPrimitive({ value }: { value: AbstractParsedOperation<HierarchicalInfo> }) {
    const store = useBaseStore()
    const timeValue = value.children[0].type === "raw" ? value.children[0].value : undefined
    const typeValue = value.children[1].type === "raw" ? value.children[1].value : undefined
    const directionValue = value.children[2].type === "raw" ? value.children[2].value : undefined

    return (
        <div className="d-flex flex-column mx-3">
            <StartLabel value="Start Time" className="mb-3 ">
                <input
                    value={timeValue}
                    type="number"
                    onChange={(e) =>
                        store.getState().replace<"operation">((draft) => {
                            draft.children[0] = { type: "raw", value: +e.currentTarget.value }
                        }, value)
                    }
                    className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                />
            </StartLabel>
            <StartLabel value="Object Type" className="mb-3 ">
                <ObjectTypeInput
                    value={typeValue}
                    onChange={(e) =>
                        store.getState().replace<"operation">((draft) => {
                            draft.children[1] = { type: "raw", value: +e.currentTarget.value }
                        }, value)
                    }
                    className="flex-grow-1 me-2 w-auto form-select form-select-sm"
                />
            </StartLabel>
            <StartLabel value="Direction in Degree" className="mb-3 ">
                <input
                    value={directionValue}
                    type="number"
                    onChange={(e) =>
                        store.getState().replace<"operation">((draft) => {
                            draft.children[2] = { type: "raw", value: +e.currentTarget.value }
                        }, value)
                    }
                    className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                />
            </StartLabel>
        </div>
    )
}
