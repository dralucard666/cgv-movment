import {
    AbstractParsedOperation,
    FullIndex,
    getIndirectParentsSteps,
    getPredecessorSelections,
    getSuccessorSelections,
    HierarchicalInfo,
    HierarchicalParsedSteps,
    SelectionsList,
    serializeStepString,
} from "cgv"
import { HTMLProps, useMemo } from "react"
import { operationGuiMap } from "../domains/shape"
import { useBaseGlobal, UseBaseStore, useBaseStore } from "../global"
import { ArrowDownRight } from "../icons/arrow-down-right"
import { ArrowLeftUp } from "../icons/arrow-left-up"
import { CheckIcon } from "../icons/check"
import { DeleteIcon } from "../icons/delete"
import { MultiSelect } from "./multi-select"
import { GUINounStep } from "./noun"
import { GUIOperation } from "./operation"
import { GUIRandomStep } from "./random"
import { GUIRawStep } from "./raw"
import { GUISwitchStep } from "./switch"
import { GUISymbolStep } from "./symbol"

export type OperationGUIMap = {
    [name in string]?: (props: { value: AbstractParsedOperation<HierarchicalInfo> }) => JSX.Element | null
}

export function childrenSelectable(operationGuiMap: OperationGUIMap, steps: HierarchicalParsedSteps): boolean {
    return steps.type !== "operation" || operationGuiMap[steps.identifier] == null
}

export function getSelectionTitle(selections: Array<SelectionsList[number] & { selected: Array<Array<number>> }>) {
    if (selections.length === 1) {
        const steps = selections[0].steps
        return steps.type === "operation" ? steps.identifier : steps.type
    }
    return `${selections.length} steps selected`
}

function requestAdd(store: UseBaseStore, type: "parallel" | "before" | "after") {
    store.getState().request("create-step", (stepGenerator) => store.getState().insert(type, stepGenerator))
}

function requestReplace(store: UseBaseStore) {
    store.getState().request("create-step", (stepGenerator) => store.getState().replace(stepGenerator))
}

export function GUI({ className, ...rest }: HTMLProps<HTMLDivElement>) {
    const store = useBaseStore()
    const selectionsList = store((state) =>
        state.type === "gui" && state.requested == null ? state.selectionsList : undefined
    )
    if (selectionsList == null || selectionsList.length === 0) {
        return null
    }
    return (
        <div {...rest} className={`${className} d-flex flex-column px-0 pt-3`}>
            <div className="d-flex flex-column">
                <div className="btn-group mx-3 mb-2 d-flex">
                    <button
                        onClick={requestAdd.bind(null, store, "before")}
                        className="btn btn-sm btn-outline-success flex-grow-1 flex-basis-0">
                        + Before
                    </button>
                    <button
                        onClick={requestAdd.bind(null, store, "parallel")}
                        className="btn btn-sm btn-outline-success flex-grow-1 flex-basis-0">
                        + Parllel
                    </button>
                    <button
                        onClick={requestAdd.bind(null, store, "after")}
                        className="btn btn-sm btn-outline-success flex-grow-1 flex-basis-0">
                        + After
                    </button>
                </div>
                <div className="btn-group mx-3 mb-3 d-flex">
                    <button
                        onClick={() => {
                            store.getState().unselectAll()
                        }}
                        className="d-flex align-items-center justify-content-center btn btn-sm btn-outline-primary flex-grow-1 flex-basis-0">
                        <CheckIcon />
                    </button>
                    <button
                        onClick={requestReplace.bind(null, store)}
                        className="btn btn-sm btn-outline-secondary flex-grow-1 flex-basis-0">
                        Replace
                    </button>
                    <button
                        onClick={store.getState().removeStep.bind(null, undefined)}
                        className="d-flex align-items-center justify-content-center btn btn-sm btn-outline-danger flex-grow-1 flex-basis-0">
                        <DeleteIcon />
                    </button>
                </div>
                {selectionsList.map((selections) => (
                    <GUISelection key={selections.steps.path.join(",")} selections={selections} />
                ))}
            </div>
        </div>
    )
}

function GUISelection({ selections }: { selections: SelectionsList[number] }) {
    const store = useBaseStore()
    const path = selections.steps.path.join(",")
    const indicesMap = store((state) => (state.type === "gui" ? state.indicesMap : undefined))
    const grammar = store((state) => (state.type === "gui" ? state.grammar : undefined))
    const all = useMemo(() => (indicesMap != null ? indicesMap[path] : undefined), [indicesMap])
    const { operationGuiMap } = useBaseGlobal()
    const parents = useMemo(
        () => (grammar != null ? getIndirectParentsSteps(selections.steps, grammar) : undefined),
        [grammar, selections]
    )
    const predecessors = useMemo(
        () =>
            indicesMap != null && parents != null
                ? getPredecessorSelections(indicesMap, parents, selections.steps, selections.indices, undefined)
                : undefined,
        [selections, indicesMap, parents]
    )
    const successors = useMemo(
        () =>
            indicesMap != null && parents != null && grammar != null
                ? getSuccessorSelections(
                      indicesMap,
                      parents,
                      selections.steps,
                      selections.indices,
                      grammar,
                      undefined,
                      childrenSelectable(operationGuiMap, selections.steps)
                  )
                : undefined,
        [selections, indicesMap, grammar, operationGuiMap]
    )

    return (
        <div className="d-flex flex-column">
            <label className="mb-3 mx-3">{getSelectionsLabel(selections)}</label>
            {predecessors != null && predecessors.length > 0 && (
                <div className="mb-3 mx-3 btn-group-vertical">
                    {predecessors.map((predecessor) => (
                        <div
                            onClick={() => store.getState().selectRelated(selections, predecessor)}
                            onMouseEnter={() => store.getState().onStartHover(predecessor.steps, predecessor.indices)}
                            onMouseLeave={() => store.getState().onEndHover(predecessor.steps)}
                            className="d-flex flex-row align-items-center btn-sm btn btn-outline-secondary"
                            key={predecessor.steps.path.join(",")}>
                            <ArrowLeftUp />
                            <span className="ms-2">{getSelectionsLabel(predecessor)}</span>
                        </div>
                    ))}
                </div>
            )}
            {all != null && (
                <MultiSelect<FullIndex>
                    selectAll={() => store.getState().select(selections.steps, undefined, "add")}
                    unselectAll={() => store.getState().select(selections.steps, undefined, "remove")}
                    className="mb-3 mx-3"
                    label={`${selections.indices.length}/${all.length} selected`}
                    onChange={(index, selected) => {
                        store.getState().select(selections.steps, index, selected ? "add" : "remove")
                    }}
                    values={getValues(selections, all)}
                />
            )}
            {successors != null && successors.length > 0 && (
                <div className="btn-group-vertical mx-3 mb-3">
                    {successors.map((successor) => (
                        <div
                            className="d-flex flex-row align-items-center btn btn-sm btn-outline-secondary"
                            onClick={() => store.getState().selectRelated(selections, successor)}
                            onMouseEnter={() => store.getState().onStartHover(successor.steps, successor.indices)}
                            onMouseLeave={() => store.getState().onEndHover(successor.steps)}
                            key={successor.steps.path.join(",")}>
                            <ArrowDownRight />
                            <span className="ms-2">{getSelectionsLabel(successor)}</span>
                        </div>
                    ))}
                </div>
            )}
            <GUISteps value={selections.steps} indices={selections.indices} />
        </div>
    )
}

function getSelectionsLabel(selections: SelectionsList[number]) {
    return selections.steps.type === "operation" ? selections.steps.identifier : selections.steps.type
}

function getValues(
    selection: SelectionsList[number],
    all: Array<FullIndex>
): Array<[label: string, selected: boolean, value: FullIndex]> {
    return all.map((index) => [
        `${index.before} -> ${index.after}`,
        selection.indices.find((selectedIndex) => selectedIndex.after === index.after) != null,
        index,
    ])
}

function GUISteps({
    value,
    indices,
}: {
    value: HierarchicalParsedSteps | string
    indices: Array<FullIndex>
}): JSX.Element | null {
    if (typeof value === "string") {
        return <GUINounStep value={value} />
    }
    switch (value.type) {
        case "raw":
            return <GUIRawStep value={value} />
        case "symbol":
            return <GUISymbolStep value={value} />
        case "operation":
            return <GUIOperation value={value} indices={indices} />
        case "random":
            return <GUIRandomStep value={value} indices={indices} />
        case "switch":
            return <GUISwitchStep value={value} indices={indices} />
        default:
            return null
    }
}
