import { AbstractParsedOperation, HierarchicalInfo, assureType, ParsedSteps } from "cgv"
import { useBaseStore } from "../../../global"
import { BlurInput } from "../../../gui/blur-input"
import { StartLabel } from "../../../gui/label"
import { GUINumberInput } from "./numberInput"
import { ObjectTypeInput } from "./objectTypeInput"
import { GUIVector3 } from "./vector"

export function GUICreateObject({ value }: { value: AbstractParsedOperation<HierarchicalInfo> }) {
    const store = useBaseStore()
    const timeValue = value.children[1].type === "raw" ? value.children[1].value : undefined
    const typeValue = value.children[2].type === "raw" ? value.children[2].value : undefined
    const directionValue = value.children[3].type === "raw" ? value.children[3].value : undefined
    const defaultValue = 0

    if (value.children[0].type !== "operation") {
        return null
    }

    const update = (index: number, number: number) => {
        return store.getState().replace<"operation">((draft) => {
            const subDraft = assureType("operation", draft)
            if (subDraft.type !== "operation") {
                return
            }
            if (subDraft.children[0].children) {
                subDraft.children[0].children[index] = {
                    type: "raw",
                    value: number,
                }
            }
        }, value)
    }

    const substepValue = value.children[0]
    const x = substepValue.children[0].type === "raw" ? substepValue.children[0].value : undefined
    const y = substepValue.children[1].type === "raw" ? substepValue.children[1].value : undefined
    const z = substepValue.children[2].type === "raw" ? substepValue.children[2].value : undefined
    return (
        <div className="d-flex flex-column mx-3">
            <StartLabel value="Start Position" className="mb-3 ">
                <div>
                    <div className="mb-3  d-flex flex-row">
                        <BlurInput
                            value={x ?? defaultValue}
                            type="number"
                            className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                            onChangeCapture={(e) => update(0, e.currentTarget.valueAsNumber)}
                        />
                    </div>
{/*                     <div className="mb-3  d-flex flex-row">
                        <BlurInput
                            value={y ?? defaultValue}
                            type="number"
                            className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                            onChangeCapture={(e) => update(1, e.currentTarget.valueAsNumber)}
                        />
                    </div> */}
                    <div className="mb-3  d-flex flex-row">
                        <BlurInput
                            value={z ?? defaultValue}
                            type="number"
                            className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                            onChangeCapture={(e) => update(2, e.currentTarget.valueAsNumber)}
                        />
                    </div>
                </div>
            </StartLabel>
            <StartLabel value="Start Time" className="mb-3 ">
                <input
                    value={timeValue}
                    type="number"
                    onChange={(e) =>
                        store.getState().replace<"operation">((draft) => {
                            draft.children[1] = { type: "raw", value: +e.currentTarget.value }
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
                            draft.children[2] = { type: "raw", value: +e.currentTarget.value }
                        }, value)
                    }
                    className="flex-grow-1 w-auto form-select form-select-sm"
                />
            </StartLabel>
            <StartLabel value="Direction in Degree" className="mb-3 ">
                <input
                    value={directionValue}
                    type="number"
                    onChange={(e) =>
                        store.getState().replace<"operation">((draft) => {
                            draft.children[3] = { type: "raw", value: +e.currentTarget.value }
                        }, value)
                    }
                    className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                />
            </StartLabel>
        </div>
    )
}
