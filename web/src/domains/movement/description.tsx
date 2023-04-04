import { MovingObject, ObjectType, Primitive } from "cgv/domains/movement"
import { Scene, Vector3 } from "three"
import { parse } from "cgv/parser"
import { interprete, simpleExecution, toValue, Value, } from "cgv"
import { wrap, proxy, expose } from "comlink"
import { operations } from "cgv/domains/movement/operations"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

/**
 *
 * @param p1
 * @param p2
 * @returns true if p1 starts with p2 (including both are the same)
 */

const defaultValue = new MovingObject(
    [
        {
            position: new Vector3(0, 0, 0),
            time: 0,
            direction: new Vector3(0, 0, 0),
        },
    ],
    ObjectType.Pedestrian,
    [],
    {} as Scene
)

export function Descriptions() {
    const [worker, setWorker] = useState<Worker>(
        new Worker(new URL("../../../../dist/interpreter/index", import.meta.url), {
            name: "interprete",
            type: "module",
        })
    )

    const [jobId, setJobId] = useState<number>(0)

    const toVal = toValue(4, undefined, [])

    async function callWorker() {
        console.log("wird gecalled")
        worker.terminate()
        setJobId((v) => v + 1)
        const newWorker = new Worker(new URL("../../../../dist/interpreter", import.meta.url), {
            name: "interprete",
            type: "module",
        })
        setWorker(newWorker)

        const interprete = wrap<import("../../../../dist/interpreter/index").InterpreteWorker>(newWorker).interprete

        setTimeout(async () => {
            await Sleep(0)
            newWorker.postMessage("message 1" + jobId)
        }, 3000)

        setTimeout(async () => {
            await Sleep(0)
            newWorker.postMessage("message 2" + jobId)
        }, 6000)

        await interprete(
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
        moveRight( 50 ) 
        `),
        {
            ...operations,
            op1: {
                execute: simpleExecution<any>((num: number, str: any) => [`${str ?? ""}${num * num}`]),
                includeThis: false,
                defaultParameters: [],
                changesTime: false,
            },
        },
            {},
            jobId,
            0
        )
    }

    useEffect(() => {
        setTimeout(() => {
            callWorker()
        }, 0)
        setTimeout(() => {
            worker.terminate()
            callWorker()
        }, 20000)
    }, [])

    worker.onmessage = function (e) {
        if (e.data.type) {
            console.log(e.data)
        }
    }

    /*      console.log(
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
	moveRight( 50 )
    `)
    )  */
    /*     workerInterprete(
        [toVal],
        parse(`
		a --> 1 | 2 * 3 | op1(3+3, "Hallo" + " Welt") | op1(2)
	`),
        {}
    ) */
    //  return <button>Hier ist ein wichtiger Button</button>
}

function Sleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

