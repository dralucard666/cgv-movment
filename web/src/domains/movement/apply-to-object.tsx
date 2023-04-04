import { MovingObject, ObjectPosition, ObjectType, Primitive, standardTime } from "cgv/domains/movement"
import { Value } from "cgv/interpreter"
import { Observable, Subscription, tap } from "rxjs"
import { Mesh, Object3D, Raycaster, Vector3 } from "three"

export function applyToObject3D(
    input: Observable<Value<Primitive>>,
    name: string,
    object: Object3D,
    toObject: (value: Value<Primitive>) => Object3D,
    onError: (error: any) => void,
): Subscription {
    return input.subscribe({
        next: (change) => {
            const data = change.raw
            //console.log(data)
            const fgfg = [].map(v=>v)
            return
        },
        error: (error) => {
            onError(error)
        },
    })
}