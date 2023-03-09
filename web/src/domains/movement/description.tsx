import { MovingObject, ObjectType, Primitive } from "cgv/domains/movement"
import { Scene, Vector3 } from "three"
import { parse } from "cgv/parser"
import { interprete, toValue, Value } from "cgv"
import { wrap, proxy } from "comlink"
import { operations } from "cgv/domains/movement/operations"

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
    const toVal = toValue(4, undefined, [])

    const worker = new Worker(new URL("./workers", import.meta.url), {
        name: "runInterprete",
        type: "module",
    })
    const { runInterprete } = wrap<import("./workers").RunInterpreter>(worker)
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
    runInterprete(
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
        {}
    )
    /*     runInterprete(
        [toVal],
        parse(`
		a --> 1 | 2 * 3 | op1(3+3, "Hallo" + " Welt") | op1(2)
	`),
        {}
    ) */

    worker.onmessage = function (e) {
        console.log(e.data)
    }
}
