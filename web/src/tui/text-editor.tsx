import { KeyboardEvent } from "react"
import { ErrorMessage } from "../error-message"
import { useBaseStore } from "../global"
import { EditIcon } from "../icons/edit"

export function TextEditor() {
    const store = useBaseStore()
    const text = store((state) => (state.type === "tui" ? state.text : undefined))
    const error = store((state) => (state.type === "tui" && !state.correct ? state.error : undefined))

    if (text == null && error == null) {
        return null
    }

    return (
        <div className="d-flex position-relative flex-grow-1">
            <textarea
                autoFocus
                style={{ resize: "none", outline: 0, tabSize: 2 }}
                value={text}
                onKeyDown={(e) => onKeyDown(e, store.getState().setText)}
                spellCheck={false}
                onChange={(e) => store.getState().setText(e.target.value)}
                className="bg-transparent p-3 border-0 flex-basis-0 flex-grow-1 text-light"
            />
            {error == null ? (
                <button
                    className="d-flex align-items-center btn btn-sm btn-primary"
                    style={{ position: "absolute", right: "1rem", bottom: "1rem" }}
                    onClick={() => store.getState().setType("gui")}>
                    <EditIcon />
                </button>
            ) : (
                <ErrorMessage
                    style={{ position: "fixed", bottom: "1rem", right: "1rem" }}
                    align="right"
                    message={error}
                />
            )}
        </div>
    )
}

function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>, setText: (text: string) => void) {
    if (e.code === "Tab") {
        e.preventDefault()
        // tab was pressed

        // get caret position/selection
        const val = e.currentTarget.value,
            start = e.currentTarget.selectionStart,
            end = e.currentTarget.selectionEnd

        // set textarea value to: text before caret + tab + text after caret
        setText(val.substring(0, start) + "\t" + val.substring(end))

        // put caret at right position again
        //e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 1

        // prevent the focus lose
        return false
    }
}
