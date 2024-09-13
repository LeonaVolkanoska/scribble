"use client";

import Header from "./components/Header/Header";
import Board from "./components/DrawingBoard/Board";
import Prompt from "./components/Prompt/Prompt";
import { useState } from "react";

interface Player {
  id: number;
  name: string;
  master: number;
}

export default function Home() {
  const [gameIsStarted, setGameIsStarted] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [name, setName] = useState<string>("");

  const handleStartGame = () => {
    setGameIsStarted(true);
    const ws = new WebSocket("ws://localhost:3000");
    ws.addEventListener("message", (e) => {
      const parsedData = JSON.parse(e.data);
      switch (parsedData.action) {
        case "join":
          {
            setPlayer({
              id: parsedData.id,
              name: name,
              master: parsedData.master,
            });
          }
          break;
      }
    });
    setSocket(ws);
  };
  return (
    <>
      <Header />
      <div>
        {gameIsStarted ? (
          <Board
            name={name}
            player={player}
            isMaster={player?.id === player?.master}
            socket={socket}
            gameIsStarted={gameIsStarted}
          />
        ) : (
          <Prompt
            handleStartGame={handleStartGame}
            setName={setName}
            name={name}
          />
        )}
      </div>
    </>
  );
}
