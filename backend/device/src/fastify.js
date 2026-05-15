import Fastify from "fastify";
import websocket from "@fastify/websocket";
import crypto from "crypto"
const fastify = Fastify()

await fastify.register(websocket)

const clients = new Map()
fastify.get("/ws", { websocket: true }, (socket, request) => {

    console.log("SOCKET CONNECTED")
    const clientId = crypto.randomUUID()

    clients.set(clientId, socket)

    socket.on("message", async (message) => {
        const data = JSON.parse(message.toString())
        console.log(data)
        socket.send(JSON.stringify({
            type: "MESSAGE SENT RETURN",
            data
        }))
    })

    socket.on("close", () => {
        clients.delete(clientId)
    })

    socket.on("error", (err) => {
        console.log("SOCKET ERROR", err)
    })

})

export default fastify