import { OperationGUIMap } from "../../../gui"
import { GUICreateFromPrimitive } from "./createFromPrimitive"
import { GUICreateObject } from "./createObject"
import { ObjectTypeInput } from "./objectTypeInput"
import { GUITwoNumbers } from "./twoNumbers"
import { GUITypedObject } from "./typedObject"

const emptyStep = () => null

export const operationGuiMap: OperationGUIMap = {
    createOb: GUICreateObject,
    pedestrian: GUITypedObject,
    cyclist: GUITypedObject,
    car: GUITypedObject,
    createFromPrimitive: GUICreateFromPrimitive,
    moveRotate: GUITwoNumbers,
    moveRotateAvoid: GUITwoNumbers,
}
