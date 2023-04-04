/* for later:
export type Domain = {
    operations: Operations<any>
    getConstant: (identifier: string) => any
    getType: (value: any) => string
}*/

import { of } from "rxjs"
import { Operations, simpleExecution } from "../interpreter"

export const defaultOperations: Operations<any> = {
    index: {
        execute: (value) => {
            const indexIndex =
                value.raw.length > 0 ? (value.raw[0] + value.index.length) % value.index.length : value.index.length - 1
            const index = value.index[indexIndex] ?? 0
            return [
                {
                    ...value,
                    raw: index,
                },
            ]
        },
        includeThis: false,
        changesTime: false,
        defaultParameters: [],
    },
    id: {
        execute: (value) => {
            return [
                {
                    ...value,
                    raw: value.index.join(","),
                },
            ]
        },
        includeThis: false,
        changesTime: false,
        defaultParameters: [],
    },
    log: {
        execute: (value) => {
            return [
                {
                    ...value,
                    raw: value.raw[0],
                },
            ]
        },
        includeThis: true,
        changesTime: false,
        defaultParameters: [],
    },
    select: {
        execute: (value) => {
            const indexIndex =
                value.raw.length > 0 ? (value.raw[0] + value.index.length) % value.index.length : value.index.length - 1
            const index = value.index[indexIndex] ?? 0
            const [current, min, max] = value.raw
            return min <= index && (max == null || index < max)
                ? [
                      {
                          ...value,
                          raw: current,
                      },
                  ]
                : []
        },
        includeThis: true,
        changesTime: false,
        defaultParameters: [() => ({ type: "raw", value: 1 }), () => ({ type: "raw", value: 2 })],
    },
    randomFloat: {
        execute: simpleExecution((min: number, max: number) => [min + (max - min) * Math.random()]),
        includeThis: false,
        changesTime: false,
        defaultParameters: [() => ({ type: "raw", value: 0 }), () => ({ type: "raw", value: 1 })],
    },
}
