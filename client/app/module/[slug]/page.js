"use client"
import {React,useState,useEffect} from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
const page = () => {
    const [lesson, setLesson] = useState({})
    const {slug} = useParams()
      useEffect(() => {
        async function fetchLesson() {
          const res = await axios.post(
            "http://localhost:5000/api/lesson/create",
            {
              id: slug,
            },
            {
              withCredentials: true,
            }
          );
          setLesson(res.data.module.lessons);
          console.log(res.data.module.lessons);
        }
        fetchLesson();
      }, []);
    
  return (
    <div>
        hello {slug}
        {lesson?.title}
    </div>
  )
}

export default page