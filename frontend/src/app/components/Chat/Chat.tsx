import { useState } from "react";
import styles from "./Chat.module.css";

interface PromptProps {
  handleChatMessage: (word: string) => void;
  check: (word: string) => void;
  chatMessage: ChatMessage[];
  playerName: string;
  isMaster: boolean;
}

interface ChatMessage {
  word: string;
  playerName: string | null;
  isCorrect: boolean | null;
}
export default function Chat({
  handleChatMessage,
  check,
  chatMessage,
}: PromptProps) {
  const [guessedWord, setGuessedWord] = useState<string>("");

  return (
    <>
      <div className={styles.container}>
        <div className={styles["words-container"]}>
          <h3 className={styles.word}>Chat:</h3>
          <ul className={styles["words-list"]}>
            {chatMessage?.map((m, index) => (
              <li key={index}>
                {m.playerName} : {m.word}{" "}
                {m.isCorrect ? "(correct)" : "(wrong)"}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.input}>
          <label htmlFor="guess-input"></label>
          <input
            placeholder="Guess the word"
            className={styles["input-guess"]}
            id="guess-input"
            required
            type="text"
            value={guessedWord}
            onChange={(e) => {
              setGuessedWord(e.target.value);
            }}
          ></input>
          <button
            className={styles["button-guess"]}
            onClick={() => {
              handleChatMessage(guessedWord);
              setGuessedWord("");
              check(guessedWord);
            }}
          >
            Check
          </button>
        </div>
      </div>
    </>
  );
}
