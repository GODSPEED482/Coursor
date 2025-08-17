"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loading from "@/components/ui/Loading";
import NotesBlock from "@/components/ui/NotesBlock";
import LinkBlock from "@/components/ui/LinkBlock";
import MCQBlock from "@/components/ui/MCQBlock";
const Page = () => {
  const [lesson, setLesson] = useState(null);
  const { slug } = useParams();
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
      // If lessons is an array, get the first lesson
      const lessons = res.data.module.lessons;
      setLesson(Array.isArray(lessons) ? lessons[0] : lessons);
      console.log(Array.isArray(lessons) ? lessons[0] : lessons);
    }
    fetchLesson();
  }, [slug]);
  /*
    {
    "title": "Java Setup & First Program",
    "content": [
        {
            "notes": "This lesson covers the fundamental setup required to start programming in Java and how to write and execute your very first Java program. Understanding these initial steps is crucial for any aspiring Java developer.\n\n**1. Understanding JVM, JRE, and JDK:**\n   - **JVM (Java Virtual Machine):** This is the core component that executes Java bytecode. When you compile a Java source file (.java) into bytecode (.class), the JVM is responsible for translating and running that bytecode on your specific operating system. It provides platform independence, allowing Java to be 'write once, run anywhere'.\n   - **JRE (Java Runtime Environment):** The JRE includes the JVM, core Java class libraries, and supporting files. If you only want to run Java applications (e.g., a user playing a Java-based game or using a Java desktop application), the JRE is sufficient.\n   - **JDK (Java Development Kit):** The JDK is a superset of the JRE. It includes everything in the JRE, plus development tools like the Java compiler (javac), debugger (jdb), and other utilities. The JDK is essential if you plan to *develop* Java applications.\n\n**2. Setting Up Environment Variables (JAVA_HOME and PATH):**\n   - For your operating system to easily find and use Java tools (like `java` for running programs and `javac` for compiling), you need to configure environment variables.\n   - **JAVA_HOME:** This variable typically points to the root directory of your JDK installation (e.g., `C:\\Program Files\\Java\\jdk-17`). Many Java-based development tools and build systems rely on `JAVA_HOME` to locate the Java installation.\n   - **PATH:** This environment variable lists directories where executable programs are located. By adding the `bin` subdirectory of your JDK installation (e.g., `C:\\Program Files\\Java\\jdk-17\\bin`) to your system's PATH, you can run `java` and `javac` commands directly from any command prompt or terminal window, without needing to specify the full path to the executables.\n\n**3. Choosing and Setting Up an IDE (Integrated Development Environment):**\n   - While you can write Java code in a simple text editor, an IDE significantly boosts productivity. IDEs provide features like code completion, syntax highlighting, debugging tools, project management, and built-in compilation.\n   - **Popular Java IDEs:**\n     - **IntelliJ IDEA (Community Edition):** Highly recommended for its intelligent code assistance and user-friendly interface.\n     - **Eclipse:** A widely used, open-source IDE with a vast ecosystem of plugins.\n     - **VS Code (with Java Extension Pack):** A lightweight but powerful editor that can be extended to support full-fledged Java development.\n   - Installation typically involves downloading the installer from the official website and following the setup wizard.\n\n**4. Writing Your First Java Program (\"Hello World\"):**\n   - Let's create the classic \"Hello, World!\" program.\n   - **Steps (using a text editor/command prompt):**\n     1. Create a new file named `HelloWorld.java`.\n     2. Type the following code:\n        java\n        public class HelloWorld {\n            public static void main(String[] args) {\n                System.out.println(\"Hello, World!\");\n            }\n        }\n        \n     3. Open a command prompt or terminal.\n     4. Navigate to the directory where you saved `HelloWorld.java`.\n     5. **Compile:** Run `javac HelloWorld.java`.\n        - If successful, this will create a `HelloWorld.class` file in the same directory.\n     6. **Run:** Run `java HelloWorld`.\n        - You should see `Hello, World!` printed on your console.\n   - **Explanation of the code:**\n     - `public class HelloWorld`: Declares a public class named `HelloWorld`. In Java, all code resides within classes. The class name must match the filename (without the .java extension).\n     - `public static void main(String[] args)`: This is the main method, the entry point for any Java application. The JVM starts executing code from here.\n       - `public`: Access modifier, meaning it can be accessed from anywhere.\n       - `static`: Means the method belongs to the class, not an instance of the class. It can be called without creating an object of the class.\n       - `void`: Indicates that the method does not return any value.\n       - `main`: The name of the method recognized by the JVM as the program's entry point.\n       - `String[] args`: An array of `String` objects that can hold command-line arguments passed to the program.\n     - `System.out.println(\"Hello, World!\");`: This statement prints the string \"Hello, World!\" to the console.\n       - `System`: A final class from the `java.lang` package.\n       - `out`: A static member of the `System` class, which is an instance of `PrintStream`.\n       - `println()`: A method of the `PrintStream` class that prints a line of text to the console and then moves to the next line.",
             "links" :[ "https://www.geeksforgeeks.org/concurrency-in-java/"
                  "https://docs.oracle.com/javase/tutorial/essential/concurrency/"
                  "https://www.baeldung.com/java-thread-creation"]
            "mcqs": [
                {
                    "question": "Which Java component is primarily used for *running* Java applications without developing them?",
                    "options": {
                        "A": "JDK",
                        "B": "JVM",
                        "C": "JRE",
                        "D": "JIT"
                    },
                    "answer": "C"
                },
                {
                    "question": "What is the correct command to compile a Java source file named `MyProgram.java`?",
                    "options": {
                        "A": "java MyProgram",
                        "B": "javac MyProgram.java",
                        "C": "run MyProgram",
                        "D": "compile MyProgram.java"
                    },
                    "answer": "B"
                },
                {
                    "question": "The `PATH` environment variable is crucial for:",
                    "options": {
                        "A": "Specifying the home directory of Java installation (JDK).",
                        "B": "Allowing the operating system to find `java` and `javac` commands from any directory.",
                        "C": "Defining the default memory for Java applications.",
                        "D": "Locating external Java libraries required by an application."
                    },
                    "answer": "B"
                },
                {
                    "question": "Which of the following is the correct signature for the main method, the entry point of a Java application?",
                    "options": {
                        "A": "public void main(String[] args)",
                        "B": "static void main()",
                        "C": "public static void main(String args[])",
                        "D": "public static int main(String[] args)"
                    },
                    "answer": "C"
                },
                {
                    "question": "Which IDE is often recommended for its intelligent code completion and user-friendliness?",
                    "options": {
                        "A": "Notepad++",
                        "B": "Sublime Text",
                        "C": "IntelliJ IDEA",
                        "D": "Vim"
                    },
                    "answer": "C"
                }
            ]
        }
    ],
    "_id": "689dc39f5b080da2f1aefeb4",
    "__v": 0
}
    */
  if (!lesson) return <Loading />;
  const content = lesson?.content || {};
  return (
    <main className="flex overflow-auto flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <div className="p-4">
        <h1 className="text-5xl font-bold mb-6 text-white/80 ">
          {lesson.title}
        </h1>
        <NotesBlock notes={content.notes} />
        <LinkBlock links={content.links} />
        <MCQBlock mcqs={content.mcqs} />
      </div>
    </main>
  );
};





export default Page;
