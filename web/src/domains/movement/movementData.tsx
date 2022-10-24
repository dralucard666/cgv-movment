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
    },
    {
        image: "./models/bookstore.glb",
        width: 1424,
        height: 1088,
        scale: [260, 280, 310],
        position: [-20, 0, -20],
        rotation: [0, 0, 0],
        name: "Bookstore",
        dataSize: 0,
        staticObjects: ["simonTest"],
        enumName: WorldEnum.Bookstore,
    },
    {
        image: "./models/eth.glb",
        width: 640,
        height: 480,
        scale: [280, 280, 280],
        position: [0, -192, -20],
        rotation: [0, -Math.PI / 2, 0],
        name: "ETH",
        dataSize: 0,
        staticObjects: ["simonTest"],
        enumName: WorldEnum.Eth,
    },
    {
        image: "./models/hotel.glb",
        width: 720,
        height: 576,
        scale: [140, 140, 140],
        position: [0, 4, 40],
        rotation: [0, -Math.PI / 2, 0],
        name: "HOTEL",
        dataSize: 0,
        staticObjects: ["simonTest"],
        enumName: WorldEnum.Hotel,
    },
    {
        image: "./models/zara.glb",
        width: 720,
        height: 576,
        scale: [140, 140, 140],
        position: [0, 60, -20],
        rotation: [0, 0, 0],
        name: "ZARA01",
        dataSize: 0,
        staticObjects: ["simonTest"],
        enumName: WorldEnum.Zara,
    },
    {
        image: "./models/zara.glb",
        width: 720,
        height: 576,
        scale: [140, 140, 140],
        position: [0, 60, -20],
        rotation: [0, 0, 0],
        name: "ZARA02",
        dataSize: 0,
        staticObjects: ["simonTest"],
        enumName: WorldEnum.Zara,
    },
]
