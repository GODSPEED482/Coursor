"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "./button"
import Loading from "./Loading"
export default function Component() {
  const { data : session,status } = useSession() 
  if(status === "loading") {
    return <Loading />
  }
  if (session) {
    return (
      <>
         {session.user.name} <br />
        <Button onClick={() => signOut()}>Sign out</Button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <Button onClick={() => signIn()}>Sign in</Button>
    </>
  )
}

