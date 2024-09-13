import { useEffect, useState } from "react";
import styles from "./WordGenerator.module.css";

interface PromptProps {
  setPickedWord: (e: any) => void;
  sendGeneratedWord: (word: string) => void;
  pickedWord: string;
  isMaster: boolean;
}

export default function WordGenerator({
  setPickedWord,
  pickedWord,
  sendGeneratedWord,
  isMaster,
}: PromptProps) {
  const randomWords: string[] = [
    "apple",
    "boat",
    "cat",
    "dog",
    "egg",
    "fish",
    "frog",
    "house",
    "ice",
    "jug",
    "kite",
    "lamp",
    "moon",
    "nose",
    "orange",
    "pencil",
    "queen",
    "rose",
    "sun",
    "tree",
    "umbrella",
    "vase",
    "whale",
    "xylophone",
    "yogurt",
    "zebra",
    "chair",
    "car",
    "shoe",
    "book",
    "hat",
    "cup",
    "ball",
    "star",
    "bed",
    "door",
    "clock",
    "leaf",
    "bird",
    "truck",
    "pen",
    "sock",
    "towel",
    "map",
    "window",
    "bridge",
    "pillow",
    "blanket",
    "sandwich",
  ];

  const randomWordPicker = (words: string[]) => {
    let index: number = Math.floor(Math.random() * words.length);
    const word = words[index];
    setPickedWord(word);
    sendGeneratedWord(word);
    return pickedWord;
  };

  return (
    <div>
      {pickedWord ? (
        <h1>Generated Word: {pickedWord}</h1>
      ) : (
        isMaster && (
          <button
            className={styles.generator}
            onClick={() => randomWordPicker(randomWords)}
          >
            {pickedWord ? pickedWord : "Pick a Word"}
          </button>
        )
      )}
    </div>
  );
}
