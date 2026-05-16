"use client"
import React, { useState } from 'react'

const RoomScreen = ({ onJoin }) => {

    const [input, setInput] = useState('')
    const [error, setError] = useState('')

    const createRoom = () => {
        const roomId = crypto.randomUUID()
        onJoin(roomId)
    }

    const joinRoom = () => {
        if (!input.trim()) {
            setError("ENTER_ROOM_ID")
            return
        }
        setError("")
        onJoin(input.trim())
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            gap: 16,
            padding: 24,
            background: '#f4f9f9'
        }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 600 }}>Geotrace — A Location Sharing Platform</h2>
            <p style={{ margin: 0, color: '#6b7280', textAlign: 'center' }}>
                Create a room and share the ID with a friend
            </p>

            <button onClick={createRoom} style={btnStyle('#2563eb')}>
                Create New Room
            </button>

            <p style={{ margin: 0, color: '#9ca3af' }}>- or join existing room</p>

            <input
                placeholder="Paste Room ID here"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && joinRoom()}
                style={inputStyle}
            />

            {error && (
                <p style={{ margin: 0, color: '#dc2626', fontSize: 13 }}>{error}</p>
            )}

            <button onClick={joinRoom} style={btnStyle('#16a34a')}>
                Join Room
            </button>
        </div>
    )
}

const btnStyle = (bg) => ({
    background: bg,
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: 8,
    fontSize: 16,
    cursor: 'pointer',
    width: '100%',
    maxWidth: 300
})

const inputStyle = {
    border: '1px solid #d1d5db',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 15,
    width: '100%',
    maxWidth: 300,
    outline: 'none'
}

export default RoomScreen
