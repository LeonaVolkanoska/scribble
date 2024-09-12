import styles from './Prompt.module.css'

interface PromptProps {
    handleStartGame: (e: any) => void
    setName: (e: any) => void
    name: string
}

export default function Prompt({ handleStartGame, setName, name }: PromptProps) {

    return (
        <div className={styles.container}>
            <div className={styles.prompt}>
                <label htmlFor='player' className={styles.text}>Enter your name:</label>
                <input id='player' value={name} onChange={(e) => setName(e.target.value)} className={styles.player} />
                <button className={styles.play} onClick={handleStartGame} >Play!</button>
            </div>
        </div>
    )
}