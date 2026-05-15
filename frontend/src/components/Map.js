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

export default function Map() {
    const [position, setPosition] = useState([0, 0])

    useEffect(() => {
        if (!navigator.geolocation) return

        let cancelled = false
        const ws = new WebSocket("ws://localhost:4001/ws")
        let watchId

        ws.onopen = () => {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    ws.send(JSON.stringify({ latitude, longitude }))
                },
                (error) => console.log(error),
                { maximumAge: 0, enableHighAccuracy: true, timeout: 5000 }
            )
        }

        ws.onmessage = (e) => {
            if (cancelled) return
            const res = JSON.parse(e.data)
            setPosition([res.data.latitude, res.data.longitude])
        }

        ws.onclose = () => console.log("Disconnected")

        return () => {
            cancelled = true
            if (watchId) navigator.geolocation.clearWatch(watchId)
            if (ws.readyState !== WebSocket.CLOSING && ws.readyState !== WebSocket.CLOSED) {
                ws.close()
            }
        }
    }, [])

    return (
        <div className='w-full h-full'>
            <MapContainer center={position} zoom={20} scrollWheelZoom={true} style={{ height: "100vh", width: "100%" }}>
                <RecentMap position={position} />
                <TileLayer url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
                <Marker position={position}>
                    <Popup>Current Location</Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}