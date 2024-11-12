// export default (async () => {
//   const url = "ws://localhost:4316/ws/timbra";
//   const ws = await connectToServer(url);

//   async function connectToServer(url: string): Promise<WebSocket> {
//     const ws = new WebSocket(url);
//     return new Promise((resolve) => {
//       const timer = setInterval(() => {
//         if (ws.readyState === ws.OPEN) {
//           clearInterval(timer);
//           resolve(ws);
//         }
//       }, 10);
//     });
//   }

//   ws.onopen = () => {
//     console.log("WebSocket is ready", ws);
//     ws.send("hello from client");
//   };

//   ws.onmessage = (ev) => {
//     const { data } = ev;
//     let msg;
//     try {
//       msg = JSON.parse(data);
//     } catch (err) {
//       msg = String(data);
//     }
//     console.log("Message from server has been received", msg);
//   };

//   return function WSSendMsg(data: unknown) {
//     const msg = JSON.stringify(data);
//     ws.send(msg);
//     console.log("Message has been sent to the server", msg);
//   };
// })();

const url = "ws://localhost:4316/ws/timbra";
const ws = new WebSocket(url);

ws.onopen = () => {
  console.log("WebSocket is ready", ws);
};

ws.onmessage = (ev) => {
  const { data } = ev;
  let msg;
  try {
    msg = JSON.parse(data);
  } catch (err) {
    msg = String(data);
  }
  console.log("Message from server has been received", msg);
};

export function WSSendMsg(data: unknown) {
  if (ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not connected to the server");
    return;
  }

  const msg = JSON.stringify(data);
  ws.send(msg);
  console.log("Message has been sent to the server", msg);
}
