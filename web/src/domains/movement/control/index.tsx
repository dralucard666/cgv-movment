import {
    FullValue,
    getSelectedStepsJoinedPath,
    getSelectedStepsPath,
    isNounOfDescription,
    SelectedSteps,
    shallowEqual,
} from "cgv"
import { Primitive } from "cgv/domains/movement"
import { useMemo } from "react"
import { Matrix4 } from "three"
import { useBaseStore } from "../../../global"
import { Point3Control } from "./point"

export function Control({ description }: { description: string }) {
    const store = useBaseStore()
    const selectionsList = store(
        (state) =>
            state.type === "gui" && state.requested == null
                ? state.selectionsList.filter((selections) =>
                      isNounOfDescription(description, getSelectedStepsPath(selections.steps)[0])
                  )
                : undefined,
        shallowEqual
    )
    if (selectionsList == null) {
        return null
    }
    return (
        <>
            {selectionsList.map((selections) => (
                <OperationControl
                    values={selections.values}
                    key={getSelectedStepsJoinedPath(selections.steps)}
                    step={selections.steps}
                />
            ))}
        </>
    )
}

function nopFn<T>(val: T): T {
    return val
}

function OperationControl({ step, values }: { values: Array<FullValue<any>>; step: SelectedSteps }) {
    if (typeof step == "string" || step.type != "operation") {
        return null
    }
    const primitiveValues = values
        .map(({ before }) => before.raw)
        .filter((value, index, self) => self.indexOf(value) === index) //distinct
        .filter(isPrimitive)
    const valueRef = useMemo(() => ({ current: step }), [])
    valueRef.current = step
    switch (step.identifier) {
        case "point3":
            return (
                <>
                    {primitiveValues.map((value, i) => (
                        <Point3Control
                            key={i}
                            matrix={new Matrix4()}
                            valueRef={valueRef}
                            getSubstep={nopFn}
                            substepValue={step}
                        />
                    ))}
                </>
            )
        default:
            return null
    }
}

function isPrimitive(val: any): val is Primitive {
    return val instanceof Primitive
}
