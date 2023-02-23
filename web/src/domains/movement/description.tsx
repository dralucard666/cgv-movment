import { Primitive } from "cgv/domains/movement"
import { Scene, Vector3 } from "three"
import { parse } from "cgv/parser"
import { interprete, toValue } from "cgv"
/**
 *
 * @param p1
 * @param p2
 * @returns true if p1 starts with p2 (including both are the same)
 */

//const defaultValue = new Primitive(new Vector3(0, 0, 0), [], new Scene())

export function Descriptions() {
    const toVal = toValue(4, undefined, undefined, [])
    //const result = interprete([toVal], parse(`a --> (5 | 6) -> { 25%: 1 25%: 2 25%: 3 25%: 4 }`), {}, {}) //.map((values) => values.map(({ raw }) => raw))
    const result = interprete([toValue(1)], parse(`a --> 10`), {}, {})?.map((v) => v.raw)
    console.log(result)
}
