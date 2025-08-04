"use client";
import React, { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import axios from "axios";
import Image from "next/image";
import { Button } from "./button";
import { LogOut, LogIn, BookOpen, Menu } from "lucide-react";

const Sidebar = () => {
  const { data: session, status } = useSession();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (session) {
      setLoading(true);
      axios
        .get("/api/courses")
        .then((res) => setCourses(res.data.courses || []))
        .catch(() => setCourses([]))
        .finally(() => setLoading(false));
    }
  }, [session]);

  return (
    <aside
      className={`h-screen ${
        collapsed ? "w-22" : "w-72"
      } bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
      flex flex-col p-4 shadow-sm transition-all duration-300 ease-in-out 
      text-zinc-900 dark:text-white`}
    >
      {/* Collapse Toggle */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-3 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
        >
          <Menu className="h-5 w-5 " />
        </button>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-3 mb-6 px-2">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={42}
            height={42}
            className="rounded-full border border-zinc-300"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 
          flex items-center justify-center text-white font-bold"
          >
            {session?.user?.name?.charAt(0) || "G"}
          </div>
        )}
        {!collapsed && (
          <div>
            <div className="font-semibold text-sm leading-tight">
              {session?.user?.name || "Guest"}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-300">
              {session?.user?.email || "Not signed in"}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700 my-3"></div>

      {/* Courses Section */}
      <div
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 
      scrollbar-track-transparent pr-2"
      >
        {status === "loading" ? (
          <p className="text-zinc-400 text-sm">Loading...</p>
        ) : session ? (
          <>
            {!collapsed && (
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-300 uppercase mb-3 tracking-wide">
                Your Courses
              </div>
            )}
            {loading ? (
              <p className="text-zinc-400 dark:text-zinc-300 text-sm">
                Loading courses...
              </p>
            ) : courses.length > 0 ? (
              <ul className="space-y-1">
                {courses.map((course) => (
                  <li
                    key={course.id}
                    className="flex items-center gap-2 px-3 py-2 text-sm 
                    text-zinc-700 dark:text-white rounded-lg hover:bg-zinc-100 
                    dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 text-zinc-500 dark:text-zinc-300" />
                    {!collapsed && course.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-400 dark:text-zinc-300 text-sm">
                No courses found.
              </p>
            )}
          </>
        ) : (
          <p className="text-zinc-400 dark:text-zinc-300 text-sm">
            {collapsed ? "" : "Your courses will appear here after login."}
          </p>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-6 mb-5">
        {session ? (
          <Button
            variant="outline"
            className="w-full flex items-center gap-2"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && "Logout"}
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full flex items-center gap-2"
            onClick={() => signIn()}
          >
            <LogIn className="h-4 w-4" />
            {!collapsed && "Login"}
          </Button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
