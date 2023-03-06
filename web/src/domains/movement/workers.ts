import { expose } from "comlink"
import { AbstractParsedGrammarDefinition, interprete, InterpreterOptions, Operations, toValue, Value } from "cgv"
import { operations } from "cgv/domains/movement/operations"

function runInterprete<T, I>(
    value: Value<T>[],
    grammar: AbstractParsedGrammarDefinition<I>,
    options: InterpreterOptions<T, I>
) {
    const result = interprete<any, any>(value, grammar, operations, options)
    //console.log(result)
    bigTask(100000000)

    return result
}

const bigTask = (int: number) => {
    const sum = new Array(int)
        .fill(0)
        .map((el, idx) => el + idx)
        .reduce((sum, el) => sum + el, 0)

    //console.log(sum)
}

const worker = {
    runInterprete,
}

export type RunInterpreter = typeof worker

expose(worker)
