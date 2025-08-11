"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import React, { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
const page = () => {
  const router = useRouter()
  const { data: session } = useSession();
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    const fetchCourses = async () => {
      if (!session) return;
      try {
        const response = await axios.post(
          "http://localhost:5000/api/course/get",
          {
            user: session.user,
          },
          { withCredentials: true }
        ); 
        setCourses(response.data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } 
    };
    fetchCourses();
  }, [session]);
  const viewCourse = async (course) => {  
      router.push(`course/${course._id}`);
  }
  return (
    <div
      className="flex flex-col p-4 h-screen bg-zinc-900 text-white"
    >
      <div className="flex flex-wrap gap-4 m-8 justify-start"
        style={{ rowGap: '2rem', columnGap: '2rem' }}>
        {courses.map((course, index) => (
          <Card key={index} className="shadow-lg p-4 rounded-lg h-fill" style={{ flex: '1 0 21%', maxWidth: '23%' }}>
            <CardTitle>
              <h1 className="text-xl font-semibold text-white ml-6 mt-2">
                {course?.title}
              </h1>
            </CardTitle>
            <CardContent>
              <p className="text-sm text-white/80">
                This is a course about {course?.title}
              </p>
            </CardContent>
            <Button onClick = {()=>viewCourse(course)}>View Course</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default page;
