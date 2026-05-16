"use client"

import RoomScreen from '@/components/RoomScreen'
import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const Map = dynamic(
  () => import('../components/Map'),
  {
    ssr: false
  }
)

const Page = () => {
  const [roomId, setRoomId] = useState(null)

  if (!roomId) return <RoomScreen onJoin={setRoomId} />
  return <Map roomId={roomId}/>
}

export default Page
