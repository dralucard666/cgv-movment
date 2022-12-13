import { AbstractParsedSteps, HierarchicalInfo } from "cgv"
import { useBaseStore } from "../../../global"

export function GUINumberInput({ value, number }: { value: AbstractParsedSteps<HierarchicalInfo>; number: number }) {
    const raw = value.type === "raw" ? value.value : undefined
    const store = useBaseStore()
    return (
        <input
        value={raw}
        type="number"
        onChange={(e) =>
            {
            return store.getState().replace<"operation">((draft) => {
                draft.children[1] = { type: "raw", value: +e.currentTarget.value }
            }, value)
        }}
        className="flex-grow-1 form-select form-select-sm"
    />
    )
}
