import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { useMovementStore } from "./useMovementStore"

export const CameraController = () => {
    const { camera, gl } = useThree()
    useEffect(() => {
        const controls = new OrbitControls(camera, gl.domElement)
        useMovementStore.getState().controls = controls
        camera.rotateX(-Math.PI / 10)
        camera.position.set(3, 100, 222.5)
        camera.rotateX(-Math.PI / 10)
        controls.update()
        controls.minDistance = 3
        controls.maxDistance = 2000
        return () => {
            controls.dispose()
        }
    }, [camera, gl])
    return null
}
