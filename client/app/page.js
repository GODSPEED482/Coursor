"use client"
import { Button } from '@/components/ui/button'
import React from 'react'
import { SessionProvider } from 'next-auth/react'
import LoginButton from '@/components/ui/login-button'

const Home = () => {
  return (
    <SessionProvider>

    <div>welcome welcome
      <LoginButton></LoginButton>
    </div>
    </SessionProvider>
  )
}

export default Home