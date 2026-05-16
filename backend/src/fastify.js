import Fastify from "fastify";
import websocket from "@fastify/websocket";
import crypto from "crypto"
const fastify = Fastify()

await fastify.register(websocket)

const clients = new Map()
const rooms = new Map()
fastify.get("/ws", { websocket: true }, (socket, request) => {

    const roomId = request.query.roomId
    if (!roomId) {
        socket.send(JSON.stringify({ type: "ERROR", message: "ROOMID REQUIRED" }));
        socket.close();
        return;
    }

    const clientId = crypto.randomUUID()
    console.log(`CLIENT CONNECTED: ${clientId}`)

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map())
    }

    const room = rooms.get(roomId)
    room.set(clientId, { socket, location: null })

    socket.send(JSON.stringify({
        type: "CONNECTED",
        clientId,
        roomId
    }));

    socket.on("message", async (message) => {
        try {

            const data = JSON.parse(message.toString())

            if (room.has(clientId)) {
                room.get(clientId).location = data
            }

            room.forEach((cl, i) => {
                if (i !== clientId) {
                    cl.socket.send(JSON.stringify({
                        type: "USER_LOCATION",
                        clientId,
                        data
                    }))
                }
            })

        } catch (err) {
            console.error("Failed to parse message:", err);
        }
    })

    socket.on("close", () => {
        room.forEach((cl, i) => {
            if (i !== clientId) {
                cl.socket.send(JSON.stringify({
                    type: "USER_LEFT",
                    clientId
                }))
            }
        })

        room.delete(clientId);

        if (room.size === 0) {
            rooms.delete(roomId);
        }
    })

    socket.on("error", (err) => {
        console.log("SOCKET ERROR", err)
    })

})

export default fastify