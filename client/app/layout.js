import { Inter, Sora } from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";
import "./globals.css";
import Provider from "../app/provider";
import Sidebar from "@/components/ui/Sidebar";
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata = {
  title: "Course Generator",
  description: "Prompt to Course Generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} antialiased font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Provider>
            <div className="flex h-screen">
              {/* Sidebar on the left */}
              <Sidebar />

              {/* Main content area */}
              <main className="flex-1 overflow-auto ">{children}</main>
            </div>
          </Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
