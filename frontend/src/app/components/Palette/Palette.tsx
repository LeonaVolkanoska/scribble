import { Ref } from 'react'
import styles from './Palette.module.css'

export default function Palette({ onColorChange, title, initialColor = "#0000000"}: { onColorChange: (e: any) => void, title: string, initialColor?: string }) {

    return (
        <div>
            <label className={styles.label} htmlFor={title}>{title}</label>
            <input defaultValue={initialColor} id={title} onChange={onColorChange}
                type='color' />
        </div>
    )
}