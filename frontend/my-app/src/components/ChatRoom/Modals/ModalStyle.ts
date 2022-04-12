import { CSSProperties } from "react";

const ModalStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: 'var(--background-color)',
    border: '2px solid #000',
    boxShadow: "24",
    padding: "1rem"
}

const AlignRight: CSSProperties = {
    marginTop: "0.5rem",
    display: "flex",
    justifyContent: "right"
}

export {ModalStyle, AlignRight}