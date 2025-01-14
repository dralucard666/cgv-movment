import Sllider from "@mui/material/Slider"
import { Canvas, useThree } from "@react-three/fiber"
import React, { useState, useEffect } from "react"
import { useBaseStoreState } from "../../global"
import { PauseIcon } from "../../icons/pause"
import { PlayIcon } from "../../icons/play"
import { RepeatIcon } from "../../icons/repeat"
import Floor from "./floor"
import MovementLogicSmallScreen from "./movementLogicSmallScreen"
import { useMovementStore } from "./useMovementStore"

export const frameRate = 60

export const CameraSmallScreen = () => {
    const { camera, gl } = useThree()
    useEffect(() => {
        camera.rotateX(-Math.PI / 10)
        camera.position.set(3, 200, 400)
        camera.rotateX(-Math.PI / 10)
    }, [camera, gl])
    return null
}

export default function Slider(props: any) {
    const data = useMovementStore((e) => e.data)
    const time = useMovementStore((e) => e.time)
    const world = useMovementStore((e) => e.world)
    const setTime = useMovementStore((e) => e.setTime)
    const min = useMovementStore((e) => e.minTime)
    const max = useMovementStore((e) => e.maxTime)
    const visible = !!data && max != 0
    const [searchCanvasPos, setSearchCanvasPos] = useState<number | false>(false)
    const [smallScreenTime, setSmallScreenTime] = useState<number>(0)
    const videoEditorOpen = useBaseStoreState((e) => e.showTe)

    const handleChange = (event: any, newValue: any) => {
        useMovementStore.getState().setPlayActive(true)
        setTime(newValue)
        useMovementStore.getState().setPlayActive(false)
        setSearchCanvasPos(false)
    }

    const play = () => {
        useMovementStore.getState().setPlayActive(true)
        if (time == max - 1) {
            setTime(min)
        }
    }

    const pause = () => {
        useMovementStore.getState().setPlayActive(false)
    }

    const reset = () => {
        useMovementStore.getState().setPlayActive(false)
        setTime(min)
    }

    const onHover = (e: Event, value: any) => {
        if (e.type == "mousemove") {
            const event: MouseEvent = e as unknown as MouseEvent
            setSearchCanvasPos(event.clientX)
            setSmallScreenTime(value)
        } else {
            setSearchCanvasPos(false)
            setSmallScreenTime(0)
        }
    }

    return (
        <>
            {visible ? (
                <div
                    style={{
                        position: "absolute",
                        top: "70%",
                        zIndex: "0",
                        marginLeft: "10%",
                        marginRight: "10%",
                        width: "80%",
                        height: "5%",
                        color: "#040720",
                    }}>
                    <h4>Frame : {time}</h4>
                    {searchCanvasPos ? (
                        <Canvas
                            style={{
                                position: "absolute",
                                bottom: "75%",
                                zIndex: "0",
                                marginLeft: searchCanvasPos - 220 + "px",
                                width: "500px",
                                height: "350px",
                                border: "4px solid mediumgray",
                            }}>
                            <axesHelper />
                            <Floor world={world} />(
                            <>
                                {data
                                    ? data.map((ob) => {
                                          return (
                                              <MovementLogicSmallScreen
                                                  key={ob.id}
                                                  id={ob.id}
                                                  data={ob.framePos[smallScreenTime] ?? null}
                                                  world={world}
                                                  type={ob.type}
                                              />
                                          )
                                      })
                                    : null}
                            </>
                            ) <CameraSmallScreen />
                        </Canvas>
                    ) : null}
                    <div>
                        <Sllider
                            step={1}
                            min={min}
                            max={max}
                            value={time}
                            onChangeCommitted={handleChange}
                            onChange={onHover}
                            valueLabelDisplay="auto"
                        />
                        <div className="d-flex justify-content-center">
                            <div
                                className={`d-flex smallSize justify-content-between ${videoEditorOpen ? "w-50" : ""}`}>
                                <button type="button" className="btn btn-dark btn-sm" onClick={play}>
                                    <PlayIcon />
                                </button>
                                <button type="button" className="btn btn-dark btn-sm" onClick={pause}>
                                    <PauseIcon />
                                </button>
                                <button type="button" className="btn btn-dark btn-sm" onClick={reset}>
                                    <RepeatIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}
