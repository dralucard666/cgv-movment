import { AbstractParsedOperation, HierarchicalInfo, assureType, ParsedSteps } from "cgv"
import { useBaseStore } from "../../../global"
import { BlurInput } from "../../../gui/blur-input"
import { StartLabel } from "../../../gui/label"
import { ObjectTypeInput } from "./objectTypeInput"
import { GUIVector3 } from "./vector"

export function GUITwoNumbers({ value }: { value: AbstractParsedOperation<HierarchicalInfo> }) {
    const store = useBaseStore()
    const angle = value.children[0].type === "raw" ? value.children[0].value : undefined
    const distance = value.children[1].type === "raw" ? value.children[1].value : undefined

    return (
        <div className="d-flex flex-column mx-3">
            <StartLabel value="Direction Angle" className="mb-3 ">
                <input
                    value={angle}
                    type="number"
                    onChange={(e) =>
                        store.getState().replace<"operation">((draft) => {
                            draft.children[0] = { type: "raw", value: +e.currentTarget.value }
                        }, value)
                    }
                    className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                />
            </StartLabel>
            <StartLabel value="Distance" className="mb-3 ">
                <input
                    value={distance}
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
