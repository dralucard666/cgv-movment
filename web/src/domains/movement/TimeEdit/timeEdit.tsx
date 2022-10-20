import {
    AbstractParsedNoun,
    AbstractParsedSteps,
    getLocalDescription,
    HierarchicalInfo,
    HierarchicalPath,
    ParsedSteps,
    SelectedSteps,
    shallowEqual,
} from "cgv"
import { ObjectType, standardTime } from "cgv/domains/movement"
import { useEffect } from "react"
import { useBaseGlobal, useBaseStore, useBaseStoreState } from "../../../global"
import { framePositions, movObject, useMovementStore } from "../useMovementStore"
import { frameData, initRowNumber, pathData, PathNode, useTimeEditStore } from "./useTimeEditStore"
import { AbstractParsedParallel } from "cgv/parser"
export function TimeEdit() {
    /*     const descriptions = topDescriptions
        .map((v) => {
            const array = store(
                (state) =>
                    state.type === "gui" ? getLocalDescription(state.grammar, state.dependencyMap, v.name) : undefined,
                shallowEqual
            )
            if (!array) {
                return null
            }
            return array?.length > 0 ? array[0] : null
        })
        .filter((v) => v != null) as AbstractParsedNoun<HierarchicalInfo>[]
    const grammarsInQueue: AbstractParsedSteps<HierarchicalInfo>[] = []
    const clearedGrammars: AbstractParsedSteps<HierarchicalInfo>[] = []

    descriptions.map((v) => {
        const step = v.step
        grammarsInQueue.push(step)
        console.log(step)
        while (grammarsInQueue.length > 0) {
            const latestGrammarr = grammarsInQueue.pop()
            const latestGrammar = structuredClone(latestGrammarr)
            if (latestGrammar?.children) {
                if (latestGrammar.type === "parallel") {
                    for (const child of latestGrammar.children) {
                        grammarsInQueue.push(child)
                    }
                } else if (latestGrammar.type === "sequential") {
                    let onlySeq = true
                    for (let index = 0; index < latestGrammar.children.length; index++) {
                        const child = latestGrammar.children[index]
                        if (child.type === "parallel") {
                            onlySeq = false
                            const saveChildChildren = structuredClone(child.children)
                            for (const childchild of saveChildChildren) {
                                latestGrammar.children[index] = childchild
                                grammarsInQueue.push(structuredClone(latestGrammar))
                            }
                        }
                    }
                    if (onlySeq) {
                        //console.log(latestGrammar)
                        if (removeParallel(latestGrammar, latestGrammar)) {
                            clearedGrammars.push(latestGrammar)
                        }
                    }
                }
            }
        }
        console.log(clearedGrammars)
        return v
    })

    function removeParallel(
        grammarTree: AbstractParsedSteps<HierarchicalInfo>,
        currentNode: AbstractParsedSteps<HierarchicalInfo>
    ): boolean {
        //console.log("removeParallel")
        //console.log(currentNode)
        //console.log(grammarsInQueue)

        if (currentNode.children) {
            for (let index = 0; index < currentNode.children.length; index++) {
                const saveChild = currentNode.children[index] as AbstractParsedSteps<HierarchicalInfo>
                if (saveChild.children) {
                    const saveChildChildren = structuredClone(
                        saveChild.children
                    ) as AbstractParsedSteps<HierarchicalInfo>[]
                    if (saveChild.type === "parallel") {
                        for (const child of saveChildChildren) {
                            currentNode.children[index] = child
                            grammarsInQueue.push(structuredClone(grammarTree))
                        }
                        return false
                    } else if (saveChild.type === "sequential") {
                        const hasonlySeq = removeParallel(grammarTree, saveChild)
                        if (!hasonlySeq) {
                            return false
                        }
                    }
                }
            }
            return true
        }
        return true
    }
    console.log(descriptions) */

    const data = useMovementStore((state) => state.rowData)
    //console.log(data)
    //console.log(" hier sind die movementstore date")
    //console.log(movementStoreData)
    const setRowNumber = useTimeEditStore((state) => state.setRowNumber)
    if (data.length > useTimeEditStore.getState().rowNumber) {
        setRowNumber(data.length)
    }
    const rowNumber = useTimeEditStore.getState().rowNumber
    //console.log(rowNumber)
    //console.log(data.length)

    //console.log(rowNumber)
    //console.log(data.length)

    return (
        <>
            <EditTools />
            <div className="table-scroll" style={{ height: "40%" }}>
                <HeaderRow />
                {data
                    ? data.map((v, i) => {
                          return <Row key={i} data={v.length > 0 ? v : undefined} />
                      })
                    : null}
                {rowNumber > data.length
                    ? Array.from(Array(rowNumber - data.length).keys()).map((v) => {
                          return <Row key={v + data.length} />
                      })
                    : null}
            </div>
        </>
    )
}

const EditTools = () => {
    const addRow = useTimeEditStore((state) => state.addRowNumber)
    return (
        <div
            style={{
                width: "200%",
                height: "30px",
                display: "block",
                position: "fixed",
                backgroundColor: "#202024",
                zIndex: "10",
                marginTop: "-10",
            }}>
            <button onClick={() => addRow(1)}>addRow</button>
        </div>
    )
}

const HeaderColumn = (props: { time: number }) => {
    return (
        <div
            style={{
                height: "30px",
                width: "800px",
                backgroundColor: "grey",
                display: "inline-table",
                border: "1px outset #202024",
            }}
            className="text-center">
            Time: {props.time}
        </div>
    )
}

const HeaderRow = () => {
    const columnNumber = useTimeEditStore((state) => state.columnNumber)
    const rowArray = Array.from(Array(columnNumber + 2).keys())
    return (
        <>
            <div
                style={{
                    height: "30px",
                    width: "100px",
                    backgroundColor: "grey",
                    display: "inline-table",
                    border: "1px outset #202024",
                    marginTop: "30px",
                }}>
                //
            </div>
            {rowArray.map((i) => {
                return <HeaderColumn key={i} time={i} />
            })}
        </>
    )
}

const getRawValue = (rawValue: AbstractParsedSteps<HierarchicalInfo> | undefined) => {
    if (!rawValue) {
        return null
    }
    return rawValue.type == "raw" ? rawValue.value : null
}

function Column(props: {
    time: number
    descriptionName?: string | undefined
    data?: pathData
    showAddDescription: boolean
}) {
    const data = props.data
    const store = useBaseStore()

    //console.log('anfang')
    //store.getState().selectDescription(state?.descriptionName?.substring(6) ?? "", store.getState().shift ?? false)
    //console.log(store.getState().selectedDescriptions)
    // console.log('ende')

    const addNewRule = () => {
        if (data) {
            // store.getState().select(data.path as SelectedSteps, undefined, "replace")
        }
    }

    return (
        <div
            style={{
                height: "190px",
                width: "800px",
                backgroundColor: "#001c3d",
                color: "white",
                display: "inline-table",
                top: "0",
                bottom: "0",
                left: "0",
                right: "0",
                borderRight: "3px outset #202024",
            }}
            className="text-center">
            {!data ? (
                <div
                    style={{
                        position: "relative",
                        inset: "80px 0 0 0",
                    }}
                    className="d-flex justify-content-center">
                    <button onClick={addNewRule} type="button" className="btn btn-primary">
                        Add new Rule
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        position: "relative",
                        inset: "80px 0 0 0",
                    }}
                    className="d-flex justify-content-center">
                    <div>
                        position:
                        {data.position?.toString()}
                        <br />
                        time:
                        {data.time}
                        <br />
                        type:
                        {data.type?.toString()}
                    </div>
                </div>
            )}
        </div>
    )
}

function Row(props: { key: number; data?: pathData[] }) {
    const data = props.data
    const descriptionName = data ? data[0].name : undefined
    const startT = (data ? data[0].time ?? 0 : 0)
    const endT = (data ? data[data.length - 1].time ?? 1 : 0)
    const columnNumber = useTimeEditStore((state) => state.columnNumber)
    const setColumnNumber = useTimeEditStore((state) => state.setColumnNumber)
    if (endT > columnNumber) {
        setColumnNumber(endT + 1)
    }

    return (
        <div>
            <div
                style={{
                    height: "200px",
                    width: "100px",
                    backgroundColor: "grey",
                    display: "inline-block",
                    border: "1px outset #202024",
                }}>
                {descriptionName ? descriptionName : "add Description"}
            </div>
            {data ? (
                <>
                    {Array.from(Array(startT).keys()).map((i) => {
                        return <Column key={i} time={i} showAddDescription={false} />
                    })}
                    {data.map((v, i) => {
                        return <Column key={i + startT} time={i + startT} data={v} showAddDescription={false} />
                    })}
                    {Array.from(Array(columnNumber - endT).keys()).map((i) => {
                        return (
                            <Column
                                descriptionName={descriptionName}
                                key={i + endT}
                                time={i + endT}
                                showAddDescription={true}
                            />
                        )
                    })}
                </>
            ) : (
                Array.from(Array(columnNumber).keys()).map((i) => {
                    return <Column key={i} time={i} showAddDescription={true} />
                })
            )}
            <div
                style={{
                    height: "200px",
                    width: "800px",
                    backgroundColor: "#001c3d",
                    display: "inline-table",
                    border: "1px outset #202024",
                }}>
                <AddColumnButton />
            </div>
        </div>
    )
}

const AddColumnButton = () => {
    const addColumn = useTimeEditStore((state) => state.addColumnNumber)
    return (
        <div
            style={{
                position: "relative",
                inset: "80px 0 0 0",
            }}
            className="d-flex justify-content-center">
            <button type="button" className="btn btn-primary" onClick={() => addColumn(1)}>
                +
            </button>
        </div>
    )
}
