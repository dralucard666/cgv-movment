import { useTexture } from "@react-three/drei"
import { Suspense, useEffect, useState } from "react"
import { a } from "@react-spring/three"
import { DoubleSide, SphereBufferGeometry } from "three"
import { panoramas } from "../global"
import { getBackgroundOpacity, useViewerState } from "./state"

const geometry = new SphereBufferGeometry(500, 60, 40)

export function PanoramaView() {
    const panoramaIndex = useViewerState(({ viewType, panoramaIndex }) =>
        viewType === "3d" ? panoramaIndex : undefined
    )
    const visualType = useViewerState((state) => (state.viewType === "3d" ? state.visualType : 0))
    const opacity = getBackgroundOpacity(visualType)
    const panorama = panoramaIndex != null ? panoramas[panoramaIndex] : undefined
    if (panorama == null || opacity === 0) {
        return null
    }
    return (
        <Suspense fallback={null}>
            <Dome url={panorama.url} rotationOffset={(panorama.rotationOffset / 180) * Math.PI} />
        </Suspense>
    )
}

function Dome({ url, rotationOffset }: { url: string; rotationOffset: number }) {
    const texture = useTexture(url)
    return (
        <mesh scale={[1, 1, -1]} geometry={geometry} rotation-y={rotationOffset}>
            {<meshBasicMaterial depthWrite={false} depthTest={false} map={texture} side={DoubleSide} />}
        </mesh>
    )
}
