"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const page = () => {
  const { slug } = useParams();
  const [courses, setCourses] = useState({});
  useEffect(() => {
    async function createModule() {
      const res = await axios.post(
        "http://localhost:5000/api/modules/create",
        {
          id: slug,
        },
        {
          withCredentials: true,
        }
      );
      const course = res.data.course;
      setCourses(course);
      console.log(res.data.course);
    }
    createModule();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50 p-8">
      {courses ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Course Title */}
          <Card className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 bg-clip-text text-transparent">
                {courses.title}
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-2">
                {courses.description || "No description provided."}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Modules List */}
          {Array.isArray(courses.modules) && courses.modules.length > 0 ? (
            courses.modules.map((module, index) => (
              <Card
                key={module._id || index}
                className="bg-zinc-950 border-zinc-800 shadow-lg hover:border-zinc-700 transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-zinc-400">
                        Module {index + 1}
                      </CardDescription>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    >
                      Learn →
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300">{module.description}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-zinc-900 border-zinc-800 shadow-lg">
              <CardContent>
                <p className="text-zinc-400">No modules found for this course.</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-zinc-400 animate-pulse">Loading...</p>
        </div>
      )}
    </div>
  );
}
export default page;