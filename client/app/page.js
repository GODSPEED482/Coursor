"use client"
import { Button } from '@/components/ui/button'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import LoginButton from '@/components/ui/login-button'
import Sidebar from '@/components/ui/Sidebar'

const Home = () => {
  return (
    <SessionProvider>
      <Sidebar/>
    </SessionProvider>
  )
}

export default Home