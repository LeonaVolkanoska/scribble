import React, { useEffect } from "react";
import styles from "./WinningPrompt.module.css";

interface PromptProps {
  handleRestartGame: (e: any) => void;
  // handleGeneratingMessage: () => void;
  winnerName: string | null;
}

const WinningPrompt = React.forwardRef<HTMLDivElement, PromptProps>(
  ({ handleRestartGame, winnerName }, ref) => {
    // useEffect(() => {
    //   handleGeneratingMessage();
    // }, []);

    return (
      <div ref={ref} className={styles.overlay}>
        <div className={styles.container}>
          <div className={styles["text-container"]}>
            <p className={styles["winning-text"]}>
              🎉👏🎊{winnerName} has won!!!🎉👏🎊
              <button onClick={handleRestartGame}>Restart game</button>
            </p>
          </div>
        </div>
      </div>
    );
  }
);

export default WinningPrompt;
