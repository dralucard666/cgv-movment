import { expose } from "comlink"
import { interprete, InterpreterOptions, Value } from "./index"
import { operations } from "../domains/movement"
import { AbstractParsedGrammarDefinition } from "../parser"

async function workerInterprete<T, I>(
    value: Value<T>[],
    grammar: AbstractParsedGrammarDefinition<I>,
    options: InterpreterOptions<T, I>,
    jobId: number,
    playerTime: number
) {
    interprete<any, any>(value, grammar, operations, options, jobId, playerTime)
    return
}

const worker = {
    workerInterprete,
}

export type WorkerInterprete = typeof worker

expose(worker)
