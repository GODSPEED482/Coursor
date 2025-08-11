"use client"
import { useSession } from "next-auth/react";
import React from 'react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";
import { useRouter } from "next/navigation";
import axios from "axios";
const Home = () => {
const { data: session } = useSession();
const user = session?.user;
console.log("User session:", user);
const [course, setcourse] = useState("");
const router = useRouter();
async function handleSubmit() {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/course/create",
      {
        courseName: course,
        user: user,
      },
      { withCredentials: true }
    );
    if (res.data && res.data.success) {
      setcourse("");
      router.push("/course");
      
    } else {
      console.error("Failed to create course:", res.data?.message || res.statusText);
    }
  } catch (error) {
    console.error("Error creating course:", error?.response?.data?.message || error.message);
  }
}
    
    return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <h1 className="text-6xl font-bold mb-4 text-white/40"> 
        Course Generator Project
      </h1>
       <input
        value={course}
        onChange={(e) => setcourse(e.target.value)}
        placeholder="Login to create a course .. "
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSubmit();
          }
        }}
        className="px-5 py-4 m-10 rounded-full bg-zinc-800 text-white focus:outline-none border-1 border-white/70 focus:ring-2 focus:ring-zinc-500 w-full max-w-md"
      />  
 
      <div className="flex flex-row gap-4 mt-10 mb-8 w-full max-w-3xl justify-center">
        <Card className="flex-1 min-w-[180px] bg-zinc-900 border-zinc-100 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Fast Creation</CardTitle>
            <CardDescription>Quickly generate new courses with a simple prompt.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="flex-1 min-w-[180px] bg-zinc-900 border-zinc-100 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Videoes and Notes</CardTitle>
            <CardDescription>Get instant youtube videos and downloadable notes.</CardDescription>
          </CardHeader>
        </Card>
        <Card className="flex-1 min-w-[180px] bg-zinc-900 border-zinc-100 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Test to Speech</CardTitle>
            <CardDescription>Listen to the generated content using TTS feature</CardDescription>
          </CardHeader>
        </Card>
      </div>
   
    </main>
  )
}

export default Home