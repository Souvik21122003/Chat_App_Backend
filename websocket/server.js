import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import app from "../app.js"; // Make sure this is the correct path to your Express app
import mongoose from "mongoose";
import { Msg } from "../models/msg.model.js";

// Start the Express server

const webSocF = function () {
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is listening on port ${process.env.PORT || 3000}`);
  });

  // Create the WebSocket server and attach it to the Express server

  const wss = new WebSocketServer({ server });

  const notifyAboutOnlinePeople = function () {
    const newArr = [...wss.clients].map((c) => ({
      username: c.username,
      id: c.id,
    }));
    // Directly return the object in `map`
    [...wss.clients].forEach((client) => {
      client.send(JSON.stringify({ online: newArr }));
    });
  };

  wss.on("connection", (connection, req) => {
    try {
      const cookieTokenStringArray = req.headers.cookie
        ?.split(";")
        .find((str) => str.startsWith("refreshToken="));
      const token = cookieTokenStringArray?.split("=")[1];

      if (token) {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        connection.username = decodedToken.username;
        connection.id = decodedToken.id;
      }
      notifyAboutOnlinePeople();

      connection.isAlive = true;
      connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
          connection.isAlive = false;
          clearInterval(connection.timer);
          connection.terminate();
          notifyAboutOnlinePeople();
          console.log([...wss.clients], "here are updated connections");

          console.log("dead");
        }, 1000);
      }, 5000);

      connection.on("pong", () => {
        clearTimeout(connection.deathTimer);
      });

      connection.on("message", async (message) => {
        const msgData = JSON.parse(message).message;

        const text = msgData.text;
        const recipient = msgData.recipient;
        const sender = msgData.sender;

        const newMsg = await Msg.create({
          sender: sender,
          recipient: recipient,
          text: text,
        });

        [...wss.clients]
          .filter((c) => c.id === recipient)
          .forEach((c) =>
            c.send(
              JSON.stringify({
                msg: {
                  text: text,
                  recipient,
                  sender,
                  _id: newMsg._id,
                },
              })
            )
          );
      });
    } catch (error) {
      console.log(error.message);
    }
  });
};

export { webSocF };

//working approach

// import { WebSocketServer } from "ws";
// import jwt from "jsonwebtoken";
// import app from "../app.js";
// import mongoose from "mongoose";
// import { Msg } from "../models/msg.model.js";

// const webSocF = function () {
//   const server = app.listen(process.env.PORT || 3000, () => {
//     console.log(`Server is listening on port ${process.env.PORT || 3000}`);
//   });

//   const wss = new WebSocketServer({ server });

//   const notifyAboutOnlinePeople = function () {
//     const newArr = [...wss.clients].map((c) => ({
//       username: c.username,
//       id: c.id,
//     }));
//     wss.clients.forEach((client) => {
//       client.send(JSON.stringify({ online: newArr }));
//     });
//   };

//   wss.on("connection", (connection, req) => {
//     try {
//       connection.isAlive = true;

//       // Keep the connection alive using a ping-pong mechanism
//       connection.timer = setInterval(() => {
//         connection.ping();
//         connection.deathTimer = setTimeout(() => {
//           connection.isAlive = false;
//           clearInterval(connection.timer);
//           connection.terminate();
//           notifyAboutOnlinePeople();
//           console.log("Client connection terminated due to inactivity");
//         }, 1000);
//       }, 3000);

//       connection.on("pong", () => {
//         clearTimeout(connection.deathTimer);
//       });

//       const cookieTokenStringArray = req.headers.cookie
//         ?.split(";")
//         .find((str) => str.trim().startsWith("refreshToken="));
//       const token = cookieTokenStringArray?.split("=")[1];

//       if (token) {
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
//         connection.username = decodedToken.username;
//         connection.id = decodedToken.id;
//         notifyAboutOnlinePeople();
//       }

//       connection.on("message", async (message) => {
//         const msgData = JSON.parse(message).message;

//         const text = msgData.text;
//         const recipient = msgData.recipient;
//         const sender = msgData.sender;

//         const newMsg = await Msg.create({
//           sender: sender,
//           recipient: recipient,
//           text: text,
//         });

//         [...wss.clients]
//           .filter((c) => c.id === recipient)
//           .forEach((c) =>
//             c.send(
//               JSON.stringify({
//                 msg: {
//                   text: text,
//                   recipient,
//                   sender,
//                   _id: newMsg._id,
//                 },
//               })
//             )
//           );
//       });

//       connection.on("close", () => {
//         console.log("Client disconnected");
//         notifyAboutOnlinePeople();
//       });
//     } catch (error) {
//       console.log("Error on connection: ", error.message);
//     }
//   });
// };

// export { webSocF };
