/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import * as THREE from "three"
import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react"
import { useGLTF, useAnimations } from "@react-three/drei"
import { GLTF, SkeletonUtils } from "three-stdlib"
import { AnimationClip } from "three"
import { useFrame, useGraph } from "@react-three/fiber"
import { movObject, useMovementStore } from "./useMovementStore"
import { idPatternType } from "cgv"

type GLTFResult = GLTF & {
    nodes: {
        Body: THREE.SkinnedMesh
        Bottoms: THREE.SkinnedMesh
        Eyelashes: THREE.SkinnedMesh
        Eyes: THREE.SkinnedMesh
        Hair: THREE.SkinnedMesh
        Shoes: THREE.SkinnedMesh
        Tops: THREE.SkinnedMesh
        mixamorigHips: THREE.Bone
    }
    materials: {
        Bodymat: THREE.MeshStandardMaterial
        Bottommat: THREE.MeshStandardMaterial
        Eyelashmat: THREE.MeshStandardMaterial
        Hairmat: THREE.MeshStandardMaterial
        Shoesmat: THREE.MeshStandardMaterial
        Topmat: THREE.MeshStandardMaterial
    }
}

interface person {
    nodes: {
        Body: THREE.SkinnedMesh
        Bottoms: THREE.SkinnedMesh
        Eyelashes: THREE.SkinnedMesh
        Eyes: THREE.SkinnedMesh
        Hair: THREE.SkinnedMesh
        Shoes: THREE.SkinnedMesh
        Tops: THREE.SkinnedMesh
        mixamorigHips: THREE.Bone
    }
}

type ActionName = "Armature|mixamo.com|Layer0"

export const Person = forwardRef((props: { id: string | null; scale: number; positionY: number }, ref) => {
    const group = useRef<any>()

    const { scene, materials, animations } = useGLTF("./models/remyplace.glb") as GLTFResult
    const clones = useMemo(() => SkeletonUtils.clone(scene), [scene])
    const { nodes } = useGraph(clones) as unknown as person

    const sceneFactor = 3

    const mixer = useMemo(() => new THREE.AnimationMixer(clones), [scene])
    animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.play()
    })

    useImperativeHandle(ref, () => ({
        updatePosition(x: number, y: number, z: number, angle: number, delta: number) {
            if (group.current.position.x == x && group.current.position.z == z && group.current.rotation.y == angle) {
                mixer.setTime(0.53)
                return
            }
            group.current.rotation.y = angle
            group.current.position.y = y + 2
            group.current.position.z = z
            group.current.position.x = x
            mixer.update(delta)
        },

        hideObject() {
            group.current.visible = false
        },

        showObject() {
            group.current.visible = true
        },
    }))

    return (
        <>
            <group ref={group} dispose={null}>
                <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={props.scale}>
                    <primitive object={nodes.mixamorigHips} />
                    <skinnedMesh
                        geometry={nodes.Body.geometry}
                        material={materials.Bodymat}
                        skeleton={nodes.Body.skeleton}
                    />
                    <skinnedMesh
                        geometry={nodes.Bottoms.geometry}
                        material={materials.Bottommat}
                        skeleton={nodes.Bottoms.skeleton}
                    />
                    <skinnedMesh
                        geometry={nodes.Eyelashes.geometry}
                        material={materials.Eyelashmat}
                        skeleton={nodes.Eyelashes.skeleton}
                    />
                    <skinnedMesh
                        geometry={nodes.Eyes.geometry}
                        material={materials.Bodymat}
                        skeleton={nodes.Eyes.skeleton}
                    />
                    <skinnedMesh
                        geometry={nodes.Hair.geometry}
                        material={materials.Hairmat}
                        skeleton={nodes.Hair.skeleton}
                    />
                    <skinnedMesh
                        geometry={nodes.Shoes.geometry}
                        material={materials.Shoesmat}
                        skeleton={nodes.Shoes.skeleton}
                    />
                    <skinnedMesh
                        geometry={nodes.Tops.geometry}
                        material={materials.Topmat}
                        skeleton={nodes.Tops.skeleton}
                    />
                </group>
            </group>
        </>
    )
})

useGLTF.preload("./models/remyplace.glb")
