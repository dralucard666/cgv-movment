import { HTMLProps } from "react"

export function ObjectTypeInput({ ...rest }: HTMLProps<HTMLSelectElement>) {
    return (
        <select {...rest}>
            <option value="0">Pedestrian</option>
            <option value="1">Bicycle</option>
            <option value="2">Truck</option>
        </select>
    )
}
