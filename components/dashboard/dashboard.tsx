"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth/auth-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, User, Calendar, Search, LogOut, Settings } from "lucide-react"
import { BookSearch } from "./book-search"
import { UserProfile } from "./user-profile"
import { BorrowedBooks } from "./borrowed-books"
import { Reservations } from "./reservations"
import { ApiConfigDebug } from "@/components/debug/api-config-debug"
import { ENV } from "@/lib/config"

export function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("search")

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-soft sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="p-3 bg-blue-900 rounded-xl shadow-lg mr-4 border border-blue-800">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                {/* Show LMS on mobile, full title on desktop */}
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  <span className="block sm:hidden">LMS</span>
                  <span className="hidden sm:block">Library Management System</span>
                </h1>
                <p className="text-sm text-gray-600 font-medium">Digital Library Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 font-medium">ID: {user?.uid}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-colors-smooth shadow-soft"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-4 lg:grid-cols-4 bg-white shadow-medium border border-gray-200/50 p-1 rounded-xl">
              <TabsTrigger 
                value="search" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-soft transition-all-smooth rounded-lg px-4 py-2.5"
              >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Search Books</span>
              <span className="sm:hidden">Search</span>
            </TabsTrigger>
              <TabsTrigger 
                value="profile" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-soft transition-all-smooth rounded-lg px-4 py-2.5"
              >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
              <TabsTrigger 
                value="borrowed" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-soft transition-all-smooth rounded-lg px-4 py-2.5"
              >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Borrowed</span>
              <span className="sm:hidden">Books</span>
            </TabsTrigger>
              <TabsTrigger 
                value="reservations" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-soft transition-all-smooth rounded-lg px-4 py-2.5"
              >
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Reservations</span>
              <span className="sm:hidden">Reserved</span>
            </TabsTrigger>
            {ENV.IS_DEVELOPMENT && (
                <TabsTrigger 
                  value="debug" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-primary data-[state=active]:text-white data-[state=active]:shadow-soft transition-all-smooth rounded-lg px-4 py-2.5"
                >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Debug</span>
                <span className="sm:hidden">Debug</span>
              </TabsTrigger>
            )}
          </TabsList>
          </div>

          <TabsContent value="search" className="space-y-8 animate-slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Search Library Books</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find and reserve books from our comprehensive digital collection</p>
            </div>
            <div>
              <BookSearch />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-8 animate-slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">View your account information and library statistics</p>
            </div>
            <div>
              <UserProfile />
            </div>
          </TabsContent>

          <TabsContent value="borrowed" className="space-y-8 animate-slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Borrowed Books</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Manage your currently borrowed books and due dates</p>
            </div>
            <div>
              <BorrowedBooks />
            </div>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-8 animate-slide-up">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Reservations</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">View and manage your book reservations and requests</p>
            </div>
            <div>
              <Reservations />
            </div>
          </TabsContent>
          {ENV.IS_DEVELOPMENT && (
            <TabsContent value="debug" className="space-y-8 animate-slide-up">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Debug Information</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Development tools and API configuration</p>
              </div>
              <div>
                <ApiConfigDebug />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}

export default Dashboard