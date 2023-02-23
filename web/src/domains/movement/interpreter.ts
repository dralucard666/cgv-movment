import { toList } from "cgv/interpreter"
import { v3 } from "murmurhash"
import {
    delay,
    EMPTY,
    filter,
    groupBy,
    GroupedObservable,
    map,
    merge,
    mergeMap,
    MonoTypeOperatorFunction,
    Observable,
    of,
    OperatorFunction,
    ReplaySubject,
    shareReplay,
    take,
    tap,
    throwError,
} from "rxjs"
import {
    AbstractParsedGrammarDefinition,
    AbstractParsedRandom,
    AbstractParsedSteps,
    ParsedBinaryOperator,
    ParsedGetVariable,
    ParsedGrammarDefinition,
    ParsedIf,
    ParsedOperation,
    ParsedParallel,
    ParsedRandom,
    ParsedRaw,
    ParsedSequantial,
    ParsedSetVariable,
    ParsedSteps,
    ParsedSwitch,
    ParsedSymbol,
    ParsedUnaryOperator,
} from "../../../../src/parser/index"
import { getNounIndex } from "../../../../src/util"

export type Operation<T> = {
    execute: (parameters: Value<ReadonlyArray<T>>) => Array<Value<T>>
    includeThis: boolean
    defaultParameters: Array<() => ParsedSteps>
}

export function simpleExecution<T>(
    execute: (...parameters: ReadonlyArray<T>) => Observable<Array<T>>
): (parameters: Value<ReadonlyArray<T>>) => Observable<Array<Value<T>>> {
    return (parameters) =>
        execute(...parameters.raw).pipe(
            map((results) =>
                results.length === 1
                    ? [
                          {
                              ...parameters,
                              raw: results[0],
                          },
                      ]
                    : results.map((result, i) => ({ ...parameters, raw: result, index: [...parameters.index, i] }))
            )
        )
}

export function simpleSceneExecution<T>(
    execute: (
        variables: {
            [x: string]: Observable<any>
        },
        ...parameters: ReadonlyArray<T>
    ) => Observable<Array<T>>
): (parameters: Value<ReadonlyArray<T>>) => Observable<Array<Value<T>>> {
    return (parameters) =>
        execute(parameters.variables, ...parameters.raw).pipe(
            map((results) =>
                results.length === 1
                    ? [
                          {
                              ...parameters,
                              raw: results[0],
                          },
                      ]
                    : results.map((result, i) => ({ ...parameters, raw: result, index: [...parameters.index, i] }))
            )
        )
}

export type Operations<T> = {
    [Name in string]: Operation<T>
}

function anyInvalid(values: Array<Invalid>) {
    for (const entry of values) {
        if (entry.value) {
            return true
        }
    }
    return false
}

export type Invalid = {
    get observable(): Observable<void>
    get value(): boolean
}

export type Invalidator = Invalid & { invalidate: () => void; complete: () => void }

export function createInvalidator(): Invalidator {
    const subject = new ReplaySubject<void>(1)
    const invalid = {
        invalidate: () => {
            invalid.value = true
            subject.next()
        },
        complete: () => subject.complete(),
        observable: subject,
        value: false,
    }
    return invalid
}

export function combineInvalids(...invalids: Array<Invalid>): Invalid {
    return {
        observable: merge(...invalids.map(({ observable }) => observable)).pipe(
            shareReplay({ refCount: true, bufferSize: 1 })
        ),
        value: anyInvalid(invalids),
    }
}

export type Value<T> = {
    raw: T
    invalid: Invalid
    index: Array<number>
    variables: {
        [Name in string]: any
    }
    symbolDepth: {
        [Name in string]: number
    }
}

export type InterpreterOptions<T, I> = Readonly<{
    seed?: number
    delay?: number
    maxSymbolDepth?: number
    listeners?: {
        onRandom?: (step: AbstractParsedRandom<I>, value: Value<T>, childStepIndex: number) => void
        onBeforeStep?: (step: AbstractParsedSteps<I>, value: Value<T>[]) => void
        onAfterStep?: (step: AbstractParsedSteps<I>, value: Value<T>[]) => void
    }
}>

type InterpretionContext<T, I> = Readonly<
    {
        grammar: ParsedGrammarDefinition
        compiledGrammar: CompiledGrammar<T>
        operations: Operations<T>
        maxSymbolDepth: number
    } & InterpreterOptions<T, I>
>

type CompiledGrammar<T> = { [Name in string]: Value<T> }

export function interprete<T, I>(
    value: Value<T>[],
    grammar: AbstractParsedGrammarDefinition<I>,
    operations: Operations<T>,
    options: InterpreterOptions<T, I>
): Value<T>[] | null {
    if (grammar.length === 0) {
        return null
    }
    const startSymbolName = grammar[0].name
    const compiledGrammar: CompiledGrammar<T> = {}
    const context: InterpretionContext<T, I> = {
        grammar,
        compiledGrammar,
        operations,
        ...options,
        maxSymbolDepth: options.maxSymbolDepth ?? 100,
    }
    let newValue = value
    for (const { name, step } of grammar) {
        console.log(step)
        newValue = interpreteStep(newValue, step, context)
    }
    return newValue
}

function interpreteStep<T, I>(
    value: Value<T>[],
    step: AbstractParsedSteps<I>,
    context: InterpretionContext<T, I>
): Value<T>[] {
    const { delay: time, listeners } = context

    if (listeners?.onBeforeStep != null) {
        const onBeforeStep = listeners.onBeforeStep.bind(null, step)
        onBeforeStep(value)
    }

    const nextValue = translateStep(value, step, context)

    if (listeners?.onAfterStep != null) {
        const onAfterStep = listeners.onAfterStep.bind(null, step)
        onAfterStep(nextValue)
    }
    return nextValue
}

function translateStep<T, I>(
    value: Value<T>[],
    step: AbstractParsedSteps<I>,
    context: InterpretionContext<T, I>
): Value<T>[] {
    switch (step.type) {
        case "operation":
            return interpreteOperation(value, step, context)
        case "parallel":
            return interpreteParallel(value, step, context)
        case "raw":
            return interpreteRaw(value, step)
        case "sequential":
            return interpreteSequential(value, step, context)
        case "symbol":
            return interpreteSymbol(value, step, context)
        case "this":
            return interpreteThis(value)
        case "invert":
        case "not":
            return interpreteUnaryOperator(value, step, context)
        case "add":
        case "and":
        case "divide":
        case "equal":
        case "greater":
        case "greaterEqual":
        case "modulo":
        case "multiply":
        case "or":
        case "smaller":
        case "smallerEqual":
        case "subtract":
        case "unequal":
            return interpreteBinaryOperator(value, step, context)
        case "if":
            return interpreteIf(value, step, context)
        case "switch":
            return interpreteSwitch(value, step, context)
        case "getVariable":
            return interpreteGetVariable(value, step)
        case "setVariable":
            return interpreteSetVariable(value, step, context)
        case "random":
            return interpreteRandom(value, step, context)
    }
    return {} as Value<T>[]
}

function interpreteRandom<T, A, I>(
    value: Value<T>[],
    step: AbstractParsedRandom<I>,
    context: InterpretionContext<T, I>
): Value<T>[] {
    const newValue = [] as Value<T>[]

    const stepProb: number[] = []
    step.probabilities.forEach((curr, i) =>
        i == 0 ? stepProb.push(curr) : stepProb.push(curr + stepProb[stepProb.length - 1])
    )
    value.forEach((v) => {
        //const rand = v3(v.index.join(","), context.seed) / _32bit_max_int
        const rand = Math.random()
        const stepIndex = stepProb.findIndex((e) => rand <= e)
        if (stepIndex !== -1) {
            if (context.listeners?.onRandom != null) {
                const onRandom = context.listeners.onRandom
                onRandom(step, v, stepIndex)
            }
            const interpreVals = interpreteStep([v], step.children[stepIndex], context)
            newValue.push(...interpreVals)
        }
    })
    return newValue
}

function interpreteGetVariable<T>(value: Value<T>[], step: ParsedGetVariable): Value<T>[] {
    return value[0].variables[step.identifier]
}

function interpreteSetVariable<T, I>(
    value: Value<T>[],
    step: ParsedSetVariable,
    context: InterpretionContext<T, I>
): Value<T>[] {
    const valueOperatorFunction = interpreteStep(value, step.children[0], context)
    value.map((v) => {
        return { ...v, variables: { ...v.variables, [step.identifier]: valueOperatorFunction } }
    })
    return value
}

function interpreteSwitch<T, I>(value: Value<T>[], step: ParsedSwitch, context: InterpretionContext<T, I>): Value<T>[] {
    //const valueOperator = interpreteStep(value, step.children[0], context)[0]
    //const casesOperatorFunctions = step.children.slice(1).map((child) => interpreteStep(child, context, next))
    let newValue = value
    const conditionOperatorValue = interpreteStep(value, step.children[0], context)[0]
    step.cases.forEach((v, i) => {
        if (v.some((e) => e === conditionOperatorValue.raw)) {
            /*             if (step.children.length<=i+1){
                throw new Error(`parsing error`)
            } */
            newValue = interpreteStep(newValue, step.children[i + 1], context)
        }
    })
    return newValue
}

function interpreteSymbol<T, I>(value: Value<T>[], step: ParsedSymbol, context: InterpretionContext<T, I>): Value<T>[] {
    /*     if (getNounIndex(step.identifier, context.grammar) == null) {
        throw new Error(`unknown symbol "${step.identifier}"`)
    } */

    const depthArray = value.map((val) => (val.index.length ?? 0) >= context.maxSymbolDepth)
    if (depthArray.some((val) => val)) {
        throw new Error(`maximum symbol depth (${context.maxSymbolDepth}) reached for symbol "${step.identifier}"`)
    }

    const grammar = context.grammar.find((v) => v.name === step.identifier)
    if (!grammar) {
        throw new Error(`unknown symbol "${step.identifier}"`)
    }
    const newValue = interpreteStep(value, grammar.step, context)
    return newValue
}

function interpreteParallel<T, I>(
    value: Value<T>[],
    step: ParsedParallel,
    context: InterpretionContext<T, I>
): Value<T>[] {
    const newVal = [] as Value<T>[]
    step.children.map((childStep, i) =>
        value.map((valueStep, j) => {
            const returnVal = interpreteStep([{ ...valueStep, index: [...valueStep.index, i] }], childStep, context)
            newVal.push(...returnVal)
        })
    )
    return newVal
}

function interpreteIf<T, I>(value: Value<T>[], step: ParsedIf, context: InterpretionContext<T, I>): Value<T>[] {
    const conditionOperatorValue = interpreteStep(value, step.children[0], context)[0]
    if (conditionOperatorValue.raw) {
        return interpreteStep(value, step.children[1], context)
    } else {
        return interpreteStep(value, step.children[2], context)
    }
}

function interpreteSequential<T, I>(
    value: Value<T>[],
    step: ParsedSequantial,
    context: InterpretionContext<T, I>
): Value<T>[] {
    let newValue = value
    for (const steps of step.children) {
        newValue = interpreteStep(newValue, steps, context)
    }
    return newValue
}

function interpreteBinaryOperator<T, I>(
    value: Value<T>[],
    step: ParsedBinaryOperator,
    context: InterpretionContext<T, I>
): Value<T>[] {
    // 5 + 10 | 20 = [15,25] moglich?
    const returnreval = value.map((val) => {
        const valuesOperatorFunction = step.children.map((child) => interpreteStep([val], child, context)[0])
        const returnVal = {
            ...val,
            raw: binaryOperations[step.type](valuesOperatorFunction[0].raw, valuesOperatorFunction[1].raw),
        }
        return returnVal
    })
    return returnreval
}

function interpreteOperation<T, I>(
    value: Value<T>[],
    step: ParsedOperation,
    context: InterpretionContext<T, I>
): Value<T>[] {
    const parameters = step.children
    const operation = context.operations[step.identifier]
    if (operation == null) {
        throw new Error(`unknown operation "${step.identifier}"`)
    }
    const parameterOperatorFunctions = parameters.map((parameter) => interpreteStep(value, parameter, context))
    if (operation.includeThis) {
        parameterOperatorFunctions.unshift(value)
    }

    //operation.execute(...parameterOperatorFunctions)
    //const newVal = operatorsToArray(...parameterOperatorFunctions)

    return value
    /*     return (values) =>
        values.pipe(
            operatorsToArray(...parameterOperatorFunctions),
            mergeMap(
                (value) =>
                    operation
                        .execute(value)
                        .pipe(mergeMap((results) => merge(...results.map((result) => of(result).pipe(next))))) //TODO: simplifiable?
            )
        ) */
}

function interpreteRaw<T>(value: Value<T>[], step: ParsedRaw): Value<T>[] {
    return value.map((val) => {
        return {
            ...val,
            raw: step.value,
        }
    })
}

const unaryOperations: { [Name in ParsedUnaryOperator["type"]]: (value: any) => any } = {
    invert: (value) => -value,
    not: (value) => !value,
}

function interpreteUnaryOperator<T, I>(
    value: Value<T>[],
    step: ParsedUnaryOperator,
    context: InterpretionContext<T, I>
): Value<T>[] {
    const valueOperatorFunction = interpreteStep(value, step.children[0], context)[0]
    return value.map((val) => {
        return {
            ...val,
            raw: unaryOperations[step.type](valueOperatorFunction.raw),
        }
    })
}

const binaryOperations: { [Name in ParsedBinaryOperator["type"]]: (v1: any, v2: any) => any } = {
    add: (v1, v2) => v1 + v2,
    and: (v1, v2) => v1 && v2,
    divide: (v1, v2) => v1 / v2,
    equal: (v1, v2) => v1 == v2,
    greater: (v1, v2) => v1 > v2,
    greaterEqual: (v1, v2) => v1 >= v2,
    modulo: (v1, v2) => v1 % v2,
    multiply: (v1, v2) => v1 * v2,
    or: (v1, v2) => v1 || v2,
    smaller: (v1, v2) => v1 < v2,
    smallerEqual: (v1, v2) => v1 <= v2,
    subtract: (v1, v2) => v1 - v2,
    unequal: (v1, v2) => v1 != v2,
}

export function toValue<T>(
    primitive: T,
    invalid?: Invalid,
    index?: Array<number>,
    variables?: Value<T>["variables"][]
): Value<T> {
    const prevInvalid = createInvalidator()
    return {
        raw: primitive,
        index: index ?? [],
        invalid: prevInvalid,
        variables: variables ?? {},
        symbolDepth: {},
    }
}

function interpreteThis<T>(value: Value<T>[]): Value<T>[] {
    return value
}

const _32bit_max_int = Math.pow(2, 32)

function noop<T>(): MonoTypeOperatorFunction<T> {
    return (input) => input
}

export function toArray<T>(): OperatorFunction<Value<T>, ReadonlyArray<Value<T>>> {
    return toList<T, Array<Value<T>>>(
        () => [],
        (array) => [...array],
        (list, item, index) => list.splice(index, 0, item),
        (list, index) => list.splice(index, 1)
    )
}
