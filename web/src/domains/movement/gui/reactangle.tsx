import { AbstractParsedOperation, HierarchicalInfo, assureType } from "cgv"
import { useBaseStore } from "../../../global"
import { BlurInput } from "../../../gui/blur-input"
import { StartLabel } from "../../../gui/label"
import { Point3Control } from "../control/point"
import { GUIPoint3Step } from "./point"
import { GUIVector3 } from "./vector"

export function GUIRectangle({ value }: { value: AbstractParsedOperation<HierarchicalInfo> }) {
    const store = useBaseStore()
    const lengthValue = value.children[1].type === "raw" ? value.children[1].value : undefined
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
            <StartLabel value="Position" className="mb-3 ">
                <GUIPoint3Step value={substepValue} />
            </StartLabel>
            <StartLabel value="Length of Edge" className="mb-3 ">
                <input
                    value={lengthValue}
                    type="number"
                    onChange={(e) =>
                        store.getState().replace<"operation">((draft) => {
                            draft.children[1] = { type: "raw", value: +e.currentTarget.value }
                        }, value)
                    }
                    className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                />
            </StartLabel>
        </div>
    )
}
