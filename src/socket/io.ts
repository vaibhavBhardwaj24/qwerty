// // import { NextResponse } from "next/server";

// // import { Socket, Server as SocketServer } from "socket.io";
// // import { Server as HttpServer } from "http";
// // import { Server as NetServer, Socket as NetSocket } from "net";
// // import { NextApiRequest, NextApiResponse } from "next";
// // type NextApiResponseWithSocket = NextApiResponse & {
// //   socket: NetSocket & {
// //     server: HttpServer & {
// //       io?: SocketServer;
// //     };
// //   };
// // };
// // const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
// //   if (!res.socket.server.io) {
// //     const path = "/api/socket/io";
// //     const httpServer: HttpServer = res.socket.server as any;
// //     const io = new SocketServer(httpServer, {
// //       path,
// //       addTrailingSlash: false,
// //     });
// //     //     const io = new Server(res.socket.server);
// //     //     res.socket.server.io = io;
// //     io.on("connection", (socket) => {
// //       console.log("user added", socket.id);
// //       socket.on("join_room", (room) => {
// //         socket.join(room);
// //       });
// //       socket.on("send_changes", (deltas, fileId) => {
// //         socket.to(fileId).emit(deltas, fileId);
// //       });
// //       socket.on("new_user", (msg) => {
// //         const { user, room } = msg;
// //         socket.to(room).emit(user);
// //       });
// //     });
// //     res.socket.server.io = io;
// //   }
// //   res.end();
// // };
// // export default ioHandler;
// import { NextApiRequest, NextApiResponse } from 'next';
// import { Server as SocketServer } from 'socket.io';
// import { Server as HttpServer } from 'http';
// import { Server as NetServer, Socket as NetSocket } from 'net';

// type NextApiResponseWithSocket = NextApiResponse & {
//   socket: NetSocket & {
//     server: HttpServer & {
//       io?: SocketServer;
//     };
//   };
// };

// const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
//   if (!res.socket.server.io) {
//     console.log('Setting up socket.io');

//     const io = new SocketServer(res.socket.server as any, {
//       path: '/api/socket/io',
//       addTrailingSlash: false,
//     });

//     io.on('connection', (socket) => {
//       console.log('User connected', socket.id);

//       socket.on('join_room', (room) => {
//         socket.join(room);
//         console.log(`User ${socket.id} joined room ${room}`);
//       });

//       socket.on('send_changes', (deltas, fileId) => {
//         socket.to(fileId).emit('receive_changes', deltas);
//         console.log(`Changes sent to room ${fileId}`);
//       });

//       socket.on('new_user', (msg) => {
//         const { user, room } = msg;
//         socket.to(room).emit('user_joined', user);
//         console.log(`New user ${user} joined room ${room}`);
//       });

//       socket.on('disconnect', () => {
//         console.log('User disconnected', socket.id);
//       });
//     });

//     res.socket.server.io = io;
//   } else {
//     console.log('Socket.io already set up');
//   }
//   res.end();
// };

// export default ioHandler;
