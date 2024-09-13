import express from "express";
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

interface GameState {
  master: number | null;
  currentWord: string | null;
  clients: Record<number, WebSocket>;
}

const gameState: GameState = {
  master: null,
  currentWord: null,
  clients: {},
};

const assignMaster = () => {
  const clientIds = Object.keys(gameState.clients);
  if (clientIds.length > 0) {
    gameState.master = Number(clientIds[0]);
  } else {
    gameState.master = null;
  }
};

wss.on("connection", (ws) => {
  const id = Math.floor(Math.random() * 101);
  gameState.clients[id] = ws;

  if (!gameState.master) {
    gameState.master = id;
  }

  ws.send(JSON.stringify({ action: "join", id, master: gameState.master }));

  ws.on("message", (message) => {
    const parsedData = JSON.parse(message.toString());
    switch (parsedData.action) {
      case "draw":
        {
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              const drawData = {
                action: "draw",
                type: parsedData.type,
                x: parsedData.x,
                y: parsedData.y,
                color: parsedData.color,
              };
              client.send(JSON.stringify(drawData));
            }
          });
        }
        break;
      case "board_color_change":
        {
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              const boardColorData = {
                action: "board_color_change",
                boardColor: parsedData.boardColor,
              };
              client.send(JSON.stringify(boardColorData));
            }
          });
        }
        break;
      case "generated_word":
        {
          gameState.currentWord = parsedData.generatedWord;
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              const generatedWordData = gameState.currentWord
                ? {
                    action: "generated_word",

                    generatedWord: Array.from(
                      { length: gameState.currentWord.length },
                      (_) => "_"
                    ).join(""),
                  }
                : {
                    action: "generated_word",
                    generatedWord: "",
                  };
              client.send(JSON.stringify(generatedWordData));
            }
          });
        }
        break;
      case "chat":
        {
          const wordCheck = parsedData.word === gameState.currentWord;
          console.log(parsedData, wordCheck, gameState.master)
          if (wordCheck && parsedData.id === gameState.master) {
            return;
          }
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const chatData = {
                action: "chat",
                word: parsedData.word,
                playerName: parsedData.playerName,
                isCorrect: wordCheck,
              };
              client.send(JSON.stringify(chatData));
            }
          });
        }
        break;
      case "guess":
        {
          if (gameState.currentWord !== null) {
            const isCorrect = gameState.currentWord === parsedData.guessedWord;
            if (isCorrect && parsedData.id === gameState.master) {
              return;
            }
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                const guessData = {
                  action: "guess",
                  hasWon: isCorrect,
                  guessedWord: parsedData.guessedWord,
                  name: parsedData.name,
                };
                client.send(JSON.stringify(guessData));
              }
            });
          }
        }
        break;

      case "restart_game":
        {
          gameState.currentWord = "";
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const restartData = {
                action: "restart_game",
                hasWon: false,
                boardColor: parsedData.boardColor,
                color: parsedData.color,
                pickedWord: parsedData.pickedWord,
                chatMessage: parsedData.chatMessage,
              };
              client.send(JSON.stringify(restartData));
            }
          });
        }
        break;
    }
  });

  ws.on("close", () => {
    delete gameState.clients[id];
    if (id === gameState.master) {
      assignMaster();
    }
    console.log("Client disconnected");
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
