import React, { useEffect } from "react";
import styles from "./WinningPrompt.module.css";

interface WinningPromptProps {
  handleRestartGame: (e: any) => void;
  winnerName: string | null;
}

export default function WinningPrompt({
  handleRestartGame,
  winnerName,
}: WinningPromptProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles["text-container"]}>
          <p className={styles["winning-text"]}>
             {winnerName} has won!!!🎉👏🎊
            <button onClick={handleRestartGame}>Restart game</button>
          </p>
        </div>
      </div>
    </div>
  );
}
