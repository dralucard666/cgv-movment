import { expose } from "comlink"
import {
    AbstractParsedGrammarDefinition,
    interprete,
    InterpreterOptions,
    Operations,
    simpleExecution,
    toValue,
    Value,
} from "cgv"
import { operations } from "cgv/domains/movement/operations"

function runInterprete<T, I>(
    value: Value<T>[],
    grammar: AbstractParsedGrammarDefinition<I>,
    options: InterpreterOptions<T, I>
) {
    const result = interprete<any, any>(
        value,
        grammar,
        {
            ...operations,
            op1: {
                execute: simpleExecution<any>((num: number, str: any) => [`${str ?? ""}${num * num}`]),
                includeThis: false,
                defaultParameters: [],
                changesTime: false,
            },
        },
        options
    )

    return result
}

const worker = {
    runInterprete,
}

export type RunInterpreter = typeof worker

expose(worker)
