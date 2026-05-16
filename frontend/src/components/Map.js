"use client"
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css"

function RecentMap({ position }) {
    const map = useMap()
    useEffect(() => {
        map.setView(position)
    }, [position, map])
    return null
}

export default function Map({ roomId }) {

    const [position, setPosition] = useState([0, 0])
    const [otherUsers, setOtherUsers] = useState({})
    const [copied, setCopied] = useState(false)
    const [connected, setConnected] = useState(false)

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    useEffect(() => {
        if (!navigator.geolocation) return

        let cancelled = false

        const finalUrl = 'wss://geo-trace-v1-server.onrender.com/ws'
        // const finalUrl = "ws://localhost:4001/ws"
        const ws = new WebSocket(`${finalUrl}?roomId=${roomId}`)
        let watchId

        ws.onopen = () => {
            setConnected(true)
            console.log('WEBSOCKET CONNECTED')
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    ws.send(JSON.stringify({ latitude, longitude }))

                    if (!cancelled) setPosition([latitude, longitude])
                },
                (error) => {
                    console.error('Geolocation error:', error)
                },
                { maximumAge: 0, enableHighAccuracy: true, timeout: 5000 }
            )
        }

        ws.onmessage = (e) => {
            if (cancelled) return
            const res = JSON.parse(e.data)
            if (res.type === "USER_LOCATION") {
                setOtherUsers(prev => ({
                    ...prev, [res.clientId]: [res.data.latitude, res.data.longitude]
                }))
            }

            if (res.type === "USER_LEFT") {
                setOtherUsers(prev => {
                    const updated = { ...prev }
                    delete updated[res.clientId]
                    return updated
                })
            }
        }

        ws.onclose = () => {
            setConnected(false)
            console.log("WEBSOCKET DISCONNECTED")
        }

        ws.onerror = (error) => {
            setConnected(false)
        }

        return () => {
            cancelled = true
            if (watchId) navigator.geolocation.clearWatch(watchId)
            ws.close()
        }
    }, [roomId])

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>

            <div style={{
                position: 'fixed', top: 10, left: '50%',
                transform: 'translateX(-50%)', zIndex: 9999,
                background: 'white', borderRadius: 8,
                padding: '8px 14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', gap: 10,
                fontFamily: 'monospace', fontSize: 13,
                whiteSpace: 'nowrap'
            }}>
                <span
                    style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: connected ? '#16a34a' : '#dc2626',
                        display: 'inline-block'
                    }}
                    title={connected ? 'Connected' : 'Disconnected'}
                />
                <span>Room: <b>{roomId.slice(0, 8)}...</b></span>
                <button onClick={copyRoomId} style={{
                    background: copied ? '#16a34a' : '#2563eb',
                    color: 'white', border: 'none', borderRadius: 6,
                    padding: '4px 10px', cursor: 'pointer', fontSize: 12,
                    transition: 'all 0.2s'
                }}>
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            <div style={{
                position: 'fixed', bottom: 10, left: 10, zIndex: 9999,
                background: 'rgba(0,0,0,0.7)', color: 'white',
                padding: '8px 12px', borderRadius: 8,
                fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6
            }}>
                You: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                <br />
                Others in room: {Object.keys(otherUsers).length}
                <br />
                {connected ? 'CONNECTED' : 'DISCONNECTED'}
            </div>

            <MapContainer
                center={[20, 0]}
                zoom={15}
                scrollWheelZoom={true}
                style={{ height: '100vh', width: '100%' }}
            >
                <RecentMap position={position} />
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />

                {position[0] !== 0 && (
                    <Marker position={position}>
                        <Popup>You</Popup>
                    </Marker>
                )}

                {Object.entries(otherUsers).map(([id, pos]) => (
                    <Marker key={id} position={pos}>
                        <Popup>User {id.slice(0, 6)}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}