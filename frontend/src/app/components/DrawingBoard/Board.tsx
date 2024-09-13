"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Boards.module.css";
import Palette from "../Palette/Palette";
import WordGenerator from "../WordGenerator/WordGenerator";
import Chat from "../Chat/Chat";
import WinningPrompt from "../WinPrompt/WinningPrompt";

interface ChatMessage {
  playerName: string;
  word: string;
}

export default function Board({
  name,
  player,
  socket,
  isMaster,
}: {
  name: string;
  player: { id: number; name: string; master: number } | null;
  socket: WebSocket | null;
  gameIsStarted: boolean;
  isMaster: boolean;
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>("#000000");
  const [boardColor, setBoardColor] = useState<string>("#ffffff");
  const [pickedWord, setPickedWord] = useState<string>("");
  const [chatMessage, setChatMessage] = useState<ChatMessage[]>([]);
  const [hasWon, setHasWon] = useState<boolean | null>(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const boardRef = useRef<HTMLCanvasElement | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (e: MessageEvent) => {
      const parsedData = JSON.parse(e.data);
      if (parsedData.action === "draw") {
        draw(parsedData.type, parsedData.x, parsedData.y, parsedData.color);
      } else if (parsedData.action === "chat") {
        setChatMessage((prevMess) => [
          ...prevMess,
          {
            playerName: parsedData.playerName,
            word: parsedData.word,
          },
        ]);
      } else if (parsedData.action === "board_color_change") {
        setBoardColor(parsedData.boardColor);
      } else if (parsedData.action === "generated_word") {
        setPickedWord(parsedData.generatedWord);
      } else if (parsedData.action === "guess") {
        if (parsedData.hasWon) {
          setWinnerName(parsedData.name);
        }
        setHasWon(parsedData.hasWon);
      } else if (parsedData.action === "restart_game") {
        setHasWon(parsedData.hasWon);
        setBoardColor(parsedData.boardColor);
        setColor(parsedData.color);
        setPickedWord(parsedData.pickedWord);
        setChatMessage(parsedData.chatMessage || []);
        clearCanvas();
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  const sendGeneratedWord = (word: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "generated_word",
          generatedWord: word,
        })
      );
    }
  };

  const chat = (word: string) => {
    if (!word || word === "") return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "chat",
          word,
          playerName: name,
          id: player?.id,
        })
      );
    }
  };

  const checkIfCorrect = (guessedWord: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "guess",
          hasWon,
          guessedWord,
          name,
          id: player?.id,
        })
      );
    }
  };

  const draw = (type: string, x: number, y: number, color: string) => {
    const canvas = boardRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 2;

    if (type === "single") {
      context.fillRect(x, y, 2, 2);
      lastPositionRef.current = { x, y };
    } else if (type === "line") {
      const lastPos = lastPositionRef.current;
      if (lastPos) {
        context.beginPath();
        context.moveTo(lastPos.x, lastPos.y);
        context.lineTo(x, y);
        context.stroke();
      }
      lastPositionRef.current = { x, y };
    }
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = boardRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handleBoardStartDraw = (
    e: React.MouseEvent<HTMLCanvasElement>,
    isMaster: boolean
  ) => {
    if (!isMaster) return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoordinates(e);
    draw("single", x, y, color);

    const drawData = {
      id: player?.id,
      action: "draw",
      type: "single",
      x,
      y,
      color,
    };
    socket?.send(JSON.stringify(drawData));
  };

  const handleBoardDraw = (
    e: React.MouseEvent<HTMLCanvasElement>,
    isMaster: boolean
  ) => {
    if (!isMaster) return;
    if (!isDrawing) return;

    const { x, y } = getCanvasCoordinates(e);
    draw("line", x, y, color);

    const drawData = {
      id: player?.id,
      action: "draw",
      type: "line",
      x,
      y,
      color,
    };
    socket?.send(JSON.stringify(drawData));
  };

  const handleBoardStopDraw = () => {
    if (!isMaster) return;
    setIsDrawing(false);
    lastPositionRef.current = null;
  };

  const handleBrushColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMaster: boolean
  ) => {
    if (!isMaster) return;
    setColor(e.target.value);
  };

  const handleCanvasColorChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isMaster: boolean
  ) => {
    if (!isMaster) return;
    setBoardColor(e.target.value);
    socket?.send(
      JSON.stringify({
        action: "board_color_change",
        boardColor: e.target.value,
      })
    );
  };

  const clearCanvas = () => {
    const canvas = boardRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleRestartGame = (hasWon: boolean): void => {
    if (hasWon) {
      setHasWon(false);
      setWinnerName(null);
      setBoardColor("#ffffff");
      setColor("#000000");
      setPickedWord("");
      setChatMessage([]);
      clearCanvas();

      if (socket && socket.readyState === WebSocket.OPEN) {
        const restartData = {
          action: "restart_game",
          hasWon,
          boardColor: "#ffffff",
          color: "#000000",
          pickedWord: "",
          chatMessage: [],
        };
        socket?.send(JSON.stringify(restartData));
      }
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h2>Hi, {player?.name}</h2>
        <WordGenerator
          isMaster={isMaster}
          setPickedWord={setPickedWord}
          sendGeneratedWord={sendGeneratedWord}
          pickedWord={pickedWord}
        />

        {hasWon && (
          <WinningPrompt
            winnerName={winnerName}
            handleRestartGame={() => handleRestartGame(hasWon)}
          />
        )}
      </div>
      <div className={styles["palette-container"]}>
        <Palette
          initialColor={boardColor}
          title="canvas background"
          onColorChange={(e) => handleCanvasColorChange(e, isMaster)}
        />
        <Palette
          title="brush color"
          onColorChange={(e) => handleBrushColorChange(e, isMaster)}
        />
      </div>

      <div className={styles.board}>
        <canvas
          style={{ backgroundColor: boardColor }}
          ref={boardRef}
          onMouseDown={(e) => handleBoardStartDraw(e, isMaster)}
          onMouseMove={(e) => handleBoardDraw(e, isMaster)}
          onMouseUp={handleBoardStopDraw}
          id="board"
        ></canvas>
        <Chat
          isMaster={isMaster}
          playerName={name}
          chatMessage={chatMessage}
          handleChatMessage={chat}
          check={checkIfCorrect}
        />
      </div>
    </div>
  );
}

//TODO:
// - chat system (done)
// - random word generator (done)
// - roles (each player has a restrictions based on role(done))
// - timer of 2 mins ***
// - win prompt(done) with name(done)
// - restart everything and clear board(done)
