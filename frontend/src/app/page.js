"use client"
import Map from '@/components/Map'
import RoomScreen from '@/components/RoomScreen'
import React, { useState } from 'react'

const Page = () => {
  const [roomId, setRoomId] = useState(null)

  if (!roomId) return <RoomScreen onJoin={setRoomId} />
  return <Map roomId={roomId} />
  return (
    <Map />
  )
}

export default Page
