import { MovingObject, ObjectType, Primitive } from "cgv/domains/movement"
import { Scene, Vector3 } from "three"
import { parse } from "cgv/parser"
import { interprete, simpleExecution, toValue, Value } from "cgv"
import { wrap, proxy } from "comlink"
import { operations } from "cgv/domains/movement/operations"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import Worker from 'web-worker';

export function Workerbutton() {
    /*  const worker = new Worker(new URL("./workers", import.meta.url), {
        name: "workerInterprete",
        type: "module",
    }) */
    const [worker, setWorker] = useState<Worker>()

    useEffect(() => {
        setWorker(
            new Worker(new URL("../../../../dist/interpreter/workers", import.meta.url), {
                name: "workerInterprete",
                type: "module",
            })
        )
    }, [])

    useEffect(() => {
        if (worker) {
            worker.onmessage = (e) => {
                if (e.data.type) {
                    if (e.data.type == "result") {
                        console.log("result")
                        console.log(e.data.data)
                    }
                }
            }
        }
    }, [worker])

    const [jobId, setJobId] = useState<number>(0)

    const toVal = toValue(4, undefined, [])

    async function updateTime(time: number) {
        if (worker) {
            worker.postMessage({ type: "updateTime", data: time })
        }
    }

    async function createWorker() {
        if (worker) {
            worker.terminate()
            setJobId((v) => v + 1)
            const newWorker = new Worker(new URL("../../../../dist/interpreter/workers", import.meta.url), {
                name: "workerInterprete",
                type: "module",
            })
            setWorker(newWorker)

            const workerInterprete = wrap<import("../../../../dist/interpreter/workers").WorkerInterprete>(newWorker).workerInterprete

            /*             setTimeout(async () => {
                await Sleep(0)
                newWorker.postMessage("message 1" + jobId)
            }, 3000)

            setTimeout(async () => {
                await Sleep(0)
                newWorker.postMessage("message 2" + jobId)
            }, 6000)
 */


            workerInterprete(
                [toVal],
                parse(`a -->
        pedestrian(
            point3(
                0,
                0,
                0
            ),
            0,
            0
        ) ->
        moveRight( 50 )->
        moveRight( 50 )->
        moveRight( 50 ) ->        moveRight( 50 )->
        moveRight( 50 )->
        moveRight( 50 ) ->        moveRight( 50 )->
        moveRight( 50 )->
        moveRight( 50 )  ->       moveRight( 50 )->
        moveRight( 50 )->
        moveRight( 50 ) 
        b -->         pedestrian(
            point3(
                0,
                0,
                0
            ),
            3,
            0
        ) ->
        moveRight( 50 )->
        moveRight( 50 )
        `),

                {},
                jobId,
                0
            )
        }
    }

    return (
        <>
            <button onClick={createWorker}>spawn Worker</button>
            <button onClick={() => updateTime(3)}>increaseTime</button>
        </>
    )
}

function Sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}
