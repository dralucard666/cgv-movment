import { BufferGeometry, Material, Matrix4, Vector3 } from "three"
import { CSG } from "three-csg-ts"
import { makeTranslationMatrix } from "./math"
import { GeometryPrimitive, ObjectType, PointPrimitive, Primitive } from "./primitive"

const vectorHelper = new Vector3()
const moveVector = new Vector3()
const matrixHelper = new Matrix4()

export type Axis = "x" | "y" | "z"
export function getValueOnAxis(vector: Vector3, axis: Axis): number {
    return vector[axis]
}

function setValueOnAxis(vector: Vector3, axis: Axis, value: number): void {
    vector[axis] = value
}

const restSize = new Vector3()

export function Split(
    primitive: Primitive,
    axis: Axis,
    generatePrimitive: (matrix: Matrix4, index: number, x: number, y: number, z: number) => Primitive
): Array<Primitive> {
    primitive.getGeometrySize(restSize)
    let i = 0
    const generatedPrimitives: Array<Primitive> = []
    moveVector.set(0, 0, 0)
    while (getValueOnAxis(restSize, axis) > 0) {
        const matrix = primitive.matrix.clone()
        matrix.multiply(makeTranslationMatrix(moveVector.x, moveVector.y, moveVector.z))
        const generatedPrimitive = generatePrimitive(matrix, i, restSize.x, restSize.y, restSize.z)
        generatedPrimitive.getGeometrySize(vectorHelper)
        generatedPrimitives.push(generatedPrimitive)
        i++
        const primtiveSizeOnAxis = getValueOnAxis(vectorHelper, axis)
        setValueOnAxis(restSize, axis, getValueOnAxis(restSize, axis) - primtiveSizeOnAxis)
        setValueOnAxis(moveVector, axis, getValueOnAxis(moveVector, axis) + primtiveSizeOnAxis)
    }
    return generatedPrimitives
}

const sizeHelper = new Vector3()

export function Replace(
    primitive: Primitive,
    geometry: BufferGeometry,
    materialGenerator: (type: ObjectType) => Material
): Primitive {
    geometry.computeBoundingBox()
    geometry.boundingBox!.getSize(vectorHelper)
    primitive.getGeometrySize(sizeHelper)
    return new GeometryPrimitive(
        primitive.matrix.clone(),
        geometry.scale(sizeHelper.x / vectorHelper.x, sizeHelper.y / vectorHelper.y, sizeHelper.z / vectorHelper.z),
        materialGenerator
    )
}

export function CenterPoint(primtive: Primitive, materialGenerator: (type: ObjectType) => Material): Primitive {
    const result = new PointPrimitive(primtive.matrix, materialGenerator)
    primtive.getGeometrySize(vectorHelper)
    vectorHelper.divideScalar(2)
    result.multiplyMatrix(makeTranslationMatrix(vectorHelper.x, vectorHelper.y, vectorHelper.z))
    return result
}

export function Transform(primitive: Primitive, matrix: Matrix4): Primitive {
    return primitive.multiplyMatrix(matrix)
}

export function CSGCombine(
    p1: Primitive,
    p2: Primitive,
    applyCSGOperation: (csg1: CSG, csg2: CSG) => CSG,
    materialGenerator: (type: ObjectType) => Material
): Primitive {
    matrixHelper.copy(p2.matrix).invert().premultiply(p1.matrix)
    const g1 = p1.getGeometry()
    const g2 = p2.getGeometry()?.clone().applyMatrix4(matrixHelper)

    if (g1 == null || g2 == null) {
        throw "can't apply csg invert on primitives with no geometry"
    }

    const csg1 = CSG.fromGeometry(g1)
    const csg2 = CSG.fromGeometry(g2)

    g2?.dispose()

    return new GeometryPrimitive(
        p1.matrix.clone(),
        applyCSGOperation(csg1, csg2).toGeometry(matrixHelper.identity()),
        materialGenerator
    )
}

export function CSGInverse(primitive: Primitive, materialGenerator: (type: ObjectType) => Material): Primitive {
    const g = primitive.getGeometry()
    if (g == null) {
        throw "can't apply csg invert on primitive with no geometry"
    }
    return new GeometryPrimitive(
        primitive.matrix.clone(),
        CSG.fromGeometry(g).inverse().toGeometry(matrixHelper.identity()),
        materialGenerator
    )
}
