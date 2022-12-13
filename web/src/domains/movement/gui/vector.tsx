import { AbstractParsedOperation, HierarchicalInfo, HierarchicalParsedSteps, ParsedOperation, ParsedSteps } from "cgv"
import { Draft } from "immer"
import { useBaseStore } from "../../../global"
import { BlurInput } from "../../../gui/blur-input"

export function GUIVector3<Type extends ParsedSteps["type"]>({
    value,
    getSubstep,
    className,
    defaultValue,
}: {
    defaultValue: number
    className: string
    getSubstep: (draft: Draft<ParsedSteps & { type: Type }> | (ParsedSteps & { type: Type })) => ParsedOperation
    value: HierarchicalParsedSteps & { type: Type }
}) {
    const substepValue = getSubstep(value)
    const x = substepValue.children[0].type === "raw" ? substepValue.children[0].value : undefined
    const y = substepValue.children[1].type === "raw" ? substepValue.children[1].value : undefined
    const z = substepValue.children[2].type === "raw" ? substepValue.children[2].value : undefined
    const store = useBaseStore()

    const update = (index: number, number: number) => {
        return store.getState().replace<Type>((draft) => {
            const subDraft = getSubstep(draft)
            if (subDraft.type !== "operation") {
                return
            }
            subDraft.children[index] = {
                type: "raw",
                value: number,
            }
        }, value)
    }
    return (
        <div className={className}>
            <div className="mb-3  d-flex flex-row">
                <BlurInput
                    value={x ?? defaultValue}
                    type="number"
                    className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                    onChangeCapture={(e) => update(0, e.currentTarget.valueAsNumber)}
                />
            </div>
            <div className="mb-3  d-flex flex-row">
                <BlurInput
                    value={y ?? defaultValue}
                    type="number"
                    className="flex-grow-1 me-2 flex-basis-0 form-control form-control-sm"
                    onChangeCapture={(e) => update(1, e.currentTarget.valueAsNumber)}
                />
            </div>
            <div className="mb-3  d-flex flex-row">
                <BlurInput
                    value={z ?? defaultValue}
                    type="number"
                    className="flex-grow-1 flex-basis-0 form-control form-control-sm"
                    onChangeCapture={(e) => update(2, e.currentTarget.valueAsNumber)}
                />
            </div>
        </div>
    )
}
