import {
    HierarchicalParsedGrammarDefinition,
    toValue,
    interprete,
    HierarchicalInfo,
    ParsedSteps,
    Value,
    HierarchicalParsedSteps,
    FullValue,
    debounceBufferTime,
    getIndexRelation,
    HierarchicalRelation,
    shallowEqual,
    getLocalDescription,
    HierarchicalPath,
    isNounOfDescription,
    getSelectedStepsPath,
} from "cgv"
import { RefObject, ReactNode, useEffect, useRef } from "react"
import { of, Subscription, Subject, map } from "rxjs"
import { Color, Group, Matrix4, Mesh, MeshBasicMaterial, Object3D, SphereBufferGeometry, Vector3 } from "three"
import { UseBaseStore, useBaseStore, useBaseStoreState } from "../../global"
import { childrenSelectable } from "../../gui"
import { useViewerState } from "../shape/viewer/state"
import { operations } from "cgv/domains/movement/operations"
import { ObjectPosition, ObjectType, Primitive, MovingObject } from "cgv/domains/movement/primitives"
import { applyToObject3D } from "./apply-to-object"
import { useMovementStore } from "./useMovementStore"
import { Vector } from "three-csg-ts/lib/esm/Vector"
import { useTimeEditStore } from "./TimeEdit/useTimeEditStore"
/**
 *
 * @param p1
 * @param p2
 * @returns true if p1 starts with p2 (including both are the same)
 */
function pathStartsWith(p1: HierarchicalPath, p2: HierarchicalPath): boolean {
    if (p1 === p2) {
        return true
    }
    if (p1.length < p2.length) {
        return false
    }
    for (let i = 0; i < p2.length; i++) {
        if (p1[i] != p2[i]) {
            return false
        }
    }
    return true
}

const defaultValue = new Primitive([], new Vector3(0, 0, 0), [], null)

export function Descriptions() {
    const descriptions = useBaseStoreState((state) => state.descriptions, shallowEqual)
    return (
        <>
            {descriptions.map(({ seed, name }, index) => (
                <Description seed={seed} key={name} name={name} index={index} />
            ))}
        </>
    )
}

export function Description({ seed, name, index }: { seed: number; name: string; index: number }) {
    const store = useBaseStore()
    const isSelected = store((state) => state.selectedDescriptions.includes(name))
    const rootNode = store(
        (state) => state.grammar.find(({ name: nounName }) => isNounOfDescription(name, nounName))?.name
    )
    if (rootNode == null) {
        return null
    }
    return isSelected ? (
        <>
            {/*<Control description={name} />*/}
            {/*<DescriptionOutline rootNode={rootNode} />*/}
            <SelectedDescription seed={seed} name={name} />
            <HighlightDescription description={name} />
        </>
    ) : (
        <UnselectedDescription seed={seed} name={name} />
    )
}

const sphereGeometry = new SphereBufferGeometry()

function useSimpleInterpretation(
    description: HierarchicalParsedGrammarDefinition | undefined,
    seed: number,
    ref: RefObject<ReactNode & Group>
) {
    const store = useBaseStore()
    const name = description ? (description[0].name ? description[0].name : "") : ("" as unknown as string)
    const newdefaultValue = defaultValue
    const world = useMovementStore((e) => e.world)
    const setLoadingState = useMovementStore((e) => e.setLoadingState)

    newdefaultValue.staticObjects = world.staticObjects
    useEffect(() => {
        if (ref.current == null || description == null) {
            return
        }
        const subscription = applyToObject3D(
            of(newdefaultValue).pipe(
                map((v) => {
                    const oldTreePath = useMovementStore.getState().treePath.filter((v) => {
                        const nodeName = v.data.key.replace("Start@", "").split("_")[0]
                        return !(nodeName === name.replace("Start@", ""))
                    })
                    useMovementStore.getState().setTreePath(oldTreePath)
                    return v
                }),
                toValue(),
                interprete<Primitive, HierarchicalInfo>(description, operations, {
                    delay: store.getState().interpretationDelay,
                    seed,
                    listeners: {
                        onAfterStep: (step, value) => {
                            if (step.type === "operation") {
                                const identifier = step.identifier
                                if (
                                    identifier === "createOb" ||
                                    identifier === "pedestrian" ||
                                    identifier === "cyclist" ||
                                    identifier === "car" ||
                                    identifier === "createFromPrimitive" ||
                                    identifier === "moveRight" ||
                                    identifier === "moveLeft" ||
                                    identifier === "moveUp" ||
                                    identifier === "moveDown" ||
                                    identifier === "moveRotate" ||
                                    identifier === "standStill" ||
                                    identifier === "sample"
                                ) {
                                    value.raw.grammarSteps.push(step)
                                }
                            }
                        },
                    },
                })
            ),
            name,
            ref.current,
            (value) => {
                useViewerState.getState().setError(undefined)
                return toObject(value.raw)
            },
            (error: any) => {
                console.error(error)
                useViewerState.getState().setError(error.message)
            },
            setLoadingState
        )
        return () => {
            ref.current?.remove(...ref.current.children)
            subscription.unsubscribe()
        }
    }, [store, description, seed, world])
}

function useInterpretation(
    description: HierarchicalParsedGrammarDefinition | undefined,
    descriptionName: string,
    seed: number,
    ref: RefObject<ReactNode & Object3D>
) {
    const store = useBaseStore()
    const movementStore = useMovementStore()
    const world = useMovementStore((e) => e.world)
    const setLoadingState = useMovementStore((e) => e.setLoadingState)

    useEffect(() => {
        if (ref.current == null || description == null) {
            return
        }
        movementStore.setData(null)
        useTimeEditStore.getState().treePath = []
        let subscription: Subscription | undefined

        const beforeValuesMap = new Map<ParsedSteps, Array<Value<Primitive>>>()
        const importantStepMap = new Map<string, HierarchicalParsedSteps>()

        const afterStepSubject = new Subject<{ steps: HierarchicalParsedSteps; value: FullValue }>()

        const unsubscribeAfterStep = afterStepSubject
            .pipe(debounceBufferTime(300))
            .subscribe((entries) => store.getState().editIndices(entries, true))
        const name = description ? (description[0].name ? description[0].name : "") : ("" as unknown as string)
        const newdefaultValue = defaultValue
        newdefaultValue.staticObjects = world.staticObjects
        try {
            subscription = applyToObject3D(
                of(newdefaultValue).pipe(
                    map((v) => {
                        const oldTreePath = useMovementStore.getState().treePath.filter((v) => {
                            const nodeName = v.data.key.replace("Start@", "").split("_")[0]
                            return !(nodeName === name.replace("Start@", ""))
                        })
                        useMovementStore.getState().setTreePath(oldTreePath)
                        return v
                    }),
                    toValue(),
                    interprete<Primitive, HierarchicalInfo>(description, operations, {
                        delay: store.getState().interpretationDelay,
                        seed,
                        //TODO: we need a possibility to know when a value is removed
                        listeners: {
                            onAfterStep: (step, value) => {
                                const beforeValues = beforeValuesMap.get(step)
                                const beforeValue = beforeValues?.find((possibleBeforeValue) => {
                                    const relation = getIndexRelation(value.index, possibleBeforeValue.index)
                                    return (
                                        relation === HierarchicalRelation.Predecessor ||
                                        relation === HierarchicalRelation.Equal
                                    )
                                })
                                if (step.type === "operation") {
                                    const identifier = step.identifier
                                    if (
                                        identifier === "createOb" ||
                                        identifier === "pedestrian" ||
                                        identifier === "cyclist" ||
                                        identifier === "car" ||
                                        identifier === "createFromPrimitive" ||
                                        identifier === "moveRight" ||
                                        identifier === "moveLeft" ||
                                        identifier === "moveUp" ||
                                        identifier === "moveDown" ||
                                        identifier === "moveRotate" ||
                                        identifier === "standStill" ||
                                        identifier === "sample"
                                    ) {
                                        value.raw.grammarSteps.push(step)
                                        if (beforeValue?.raw.grammarSteps) {
                                            const beforeGrammarSteps = beforeValue.raw.grammarSteps
                                            const lastStep =
                                                beforeGrammarSteps.length > 0
                                                    ? beforeGrammarSteps[beforeGrammarSteps.length - 1]
                                                    : null
                                            if (lastStep) {
                                                if (
                                                    lastStep.path.length < step.path.length &&
                                                    (step.path.length % 2 == 0
                                                        ? step.path[step.path.length - 2] != 0
                                                        : step.path[step.path.length - 1] != 0)
                                                ) {
                                                    //console.log(lastStep)
                                                    value.raw.parallelParentStep = {
                                                        time: value.raw.grammarSteps.length - 1,
                                                        step: lastStep,
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (beforeValue != null) {
                                    afterStepSubject.next({
                                        steps: step,
                                        value: {
                                            after: value,
                                            before: beforeValue,
                                            object: value.raw instanceof Primitive ? toObject(value.raw) : undefined,
                                        },
                                    } as any)
                                }
                                const joinedIndex = value.index.join(",")
                                const prevStep = importantStepMap.get(joinedIndex)
                                if (
                                    prevStep == null ||
                                    (prevStep.path[0] === step.path[0] &&
                                        (!pathStartsWith(prevStep.path, step.path) || !childrenSelectable({}, step)))
                                ) {
                                    importantStepMap.set(joinedIndex, step)
                                }
                            },
                            onBeforeStep: (step, value) => {
                                let beforeValues = beforeValuesMap.get(step)
                                if (beforeValues == null) {
                                    beforeValues = []
                                    beforeValuesMap.set(step, beforeValues)
                                }
                                beforeValues.push(value)
                                if (step.type === "symbol") {
                                    const joinedIndex = value.index.join(",")
                                    importantStepMap.delete(joinedIndex)
                                }
                            },
                        },
                    })
                ),
                name,
                ref.current,
                (value) => {
                    const step = importantStepMap.get(value.index.join(","))
                    const child = toObject(value.raw)
                    if (step != null) {
                        const beforeValues = beforeValuesMap.get(step)
                        const beforeValue = beforeValues?.find((possibleBeforeValue) => {
                            const relation = getIndexRelation(value.index, possibleBeforeValue.index)
                            return (
                                relation === HierarchicalRelation.Predecessor || relation === HierarchicalRelation.Equal
                            )
                        })
                        if (beforeValue != null && step != null) {
                            const fullValue: any = {
                                after: value,
                                before: beforeValue,
                                object: child,
                            }
                            child.traverse((o) => {
                                o.userData.steps = step
                                o.userData.value = fullValue
                            })
                        }
                    }
                    return child
                },
                (error: any) => {
                    console.error(error)
                    useViewerState.getState().setError(error.message)
                },
                setLoadingState
            )
        } catch (error: any) {
            useViewerState.getState().setError(error.message)
        }
        return () => {
            store.getState().clearValueMap(descriptionName)
            ref.current?.remove(...ref.current.children)
            subscription?.unsubscribe()
            unsubscribeAfterStep?.unsubscribe()
        }
    }, [store, description, seed, world])
}

function toObject(primitive: Primitive): Object3D {
    const mesh = new Mesh(sphereGeometry)
    if (primitive instanceof MovingObject) {
        mesh.position.copy(primitive.position[primitive.position.length - 1].position)
    }
    return mesh
}

function HighlightDescription({ description }: { description: string }) {
    const store = useBaseStore()
    const setTime = useMovementStore((e) => e.setTime)

    const highlightedValues = store((state) => {
        if (state.type !== "gui") {
            return undefined
        }

        return Array.from(
            new Set(
                (state.hovered != null ? state.selectionsList.concat(state.hovered) : state.selectionsList)
                    .filter(({ steps }) => isNounOfDescription(description, getSelectedStepsPath(steps)[0]))
                    .reduce<Array<Object3D>>((prev, selections) => {
                        const before = selections.values[0]?.before.raw
                        const after = selections.values[0]?.after.raw
                        /*                         console.log(selections)
                        if (typeof selections.steps != "string") {
                            if (selections.steps.type == "operation") {
                                const nameOfOperation = selections.steps.identifier
                                if (nameOfOperation.includes("move") && before && after) {
                                    const newVars = after.position.slice(before.position.length)
                                    const newTime = newVars[0].time
                                    setTime(newTime)
                                } else if (before?.position) {
                                    const time = before?.position[before?.position.length - 1].time
                                    if (time) {
                                        setTime(time)
                                    }
                                }
                            }
                        } */
                        return prev.concat(
                            selections.values
                                .filter((value) => (value as any).object != null)
                                .map((value) => (value as any).object)
                        )
                    }, [])
            )
        )
    }, shallowEqual)

    if (highlightedValues == null) {
        return null
    }

    return (
        <>
            {highlightedValues.map((value) => (
                <ColorizeSelection key={value.uuid} object={value} colorAdd={0.25} />
            ))}
        </>
    )
}

function ColorizeSelection({ object, colorAdd }: { object: Object3D; colorAdd: number }) {
    useEffect(() => {
        object.traverse((obj) => {
            if ("material" in obj) {
                ((obj as any).material as MeshBasicMaterial).color.addScalar(colorAdd)
            }
        })
        return () => {
            object.traverse((obj) => {
                if ("material" in obj) {
                    ((obj as any).material as MeshBasicMaterial).color.addScalar(-colorAdd)
                }
            })
        }
    }, [object])
    return null
}

function useLocalDescription(store: UseBaseStore, name: string) {
    return store(
        (state) => (state.type === "gui" ? getLocalDescription(state.grammar, state.dependencyMap, name) : undefined),
        shallowEqual
    )
}

function UnselectedDescription({ name, seed }: { seed: number; name: string }) {
    const groupRef = useRef<ReactNode & Group>(null)
    const store = useBaseStore()
    const unselectedDescription = useLocalDescription(store, name)
    useSimpleInterpretation(unselectedDescription, seed, groupRef)
    return (
        <group
            onClick={(e) => {
                if (e.intersections[0].object.userData.steps != null) {
                    return
                }
                e.stopPropagation()
                store.getState().selectDescription(name, store.getState().shift ?? false)
            }}
            ref={groupRef}
        />
    )
}

/*
function DescriptionOutline({ rootNode }: { rootNode: string }) {
    const store = useBaseStore()

    const outlines = store((state) => {
        if (state.type !== "gui") {
            return undefined
        }

        return state.valueMap[rootNode]
            ?.filter((value) => value.after.raw instanceof Primitive)
            .map((values) => (values.after.raw as Primitive).getOutline())
    }, shallowEqual)

    if (outlines == null) {
        return null
    }

    return (
        <>
            {outlines.map((object) => (
                <primitive key={object.uuid} object={object} />
            ))}
        </>
    )
}*/

function SelectedDescription({ name, seed }: { seed: number; name: string }) {
    const store = useBaseStore()
    const selectedDescription = useLocalDescription(store, name)
    const groupRef = useRef<ReactNode & Object3D>(null)
    useInterpretation(selectedDescription, name, seed, groupRef)
    if (selectedDescription == null) {
        return null
    }
    return (
        <object3D
            onPointerMove={(e) => {
                if (e.intersections.length === 0) {
                    return
                }
                const object = e.intersections[0].object
                const steps = object.userData.steps
                const value = object.userData.value
                if (steps == null || value == null) {
                    return
                }
                e.stopPropagation()
                store.getState().onStartHover(steps, [value])
            }}
            onPointerOut={(e) => {
                const object = e.object
                const steps = object.userData.steps
                const value = object.userData.value
                if (steps == null || value == null) {
                    return
                }
                e.stopPropagation()
                store.getState().onEndHover(steps)
            }}
            onClick={(e) => {
                const object = e.intersections[0].object
                const steps = object.userData.steps
                const value = object.userData.value
                if (steps == null || value == null) {
                    return
                }
                e.stopPropagation()
                const state = store.getState()
                if (state.type != "gui") {
                    return
                }
                if (state.requested != null) {
                    return
                }
                store.getState().selectResult(steps, value)
            }}
            ref={groupRef}
        />
    )
}
