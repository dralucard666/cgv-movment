import Data from "../../../public/data/eth_eth/Langillustration_2.json"

export enum WorldEnum {
    Bookstore,
    Students,
    Eth,
    Hotel,
    Zara,
}

export interface WorldState {
    image: string
    width: number
    height: number
    position?: [number, number, number]
    scale?: [number, number, number]
    rotation?: [number, number, number]
    name: string
    data?: { [key: string]: any[] }
    dataSize: number
    staticObjects: any[]
    enumName: WorldEnum
}

export const dataWorldState: WorldState[] = [
    {
        image: "./models/bookstore.glb",
        width: 1424,
        height: 1088,
        scale: [260, 280, 310],
        position: [-20, 0, -20],
        rotation: [0, 0, 0],
        name: "BookStore Empty",
        staticObjects: ["bookstore"],
        dataSize: 0,
        enumName: WorldEnum.Bookstore,
    }
]
