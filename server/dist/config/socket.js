"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSocketServer = setSocketServer;
exports.getSocketServer = getSocketServer;
exports.emitSocketEvent = emitSocketEvent;
let ioServer = null;
function setSocketServer(io) {
    ioServer = io;
}
function getSocketServer() {
    if (!ioServer) {
        throw new Error('Socket server is not initialized');
    }
    return ioServer;
}
function emitSocketEvent(event, payload) {
    if (!ioServer)
        return;
    ioServer.emit(event, payload);
}
//# sourceMappingURL=socket.js.map