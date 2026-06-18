"use client";

import { useEffect, useState, useCallback } from "react";

type User = {
  platform: string;
  userId: string;
  displayName?: string;
  lastActive: number;
  lastMessage: string;
  isLocked: boolean;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authHeader, setAuthHeader] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const API_BASE = "";

  useEffect(() => {
    // Check system preference
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDarkMode(prefersDark);
      
      const storedAuth = localStorage.getItem("plu_auth");
      if (storedAuth) {
        setAuthHeader(storedAuth);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    // Create Basic Auth Header
    const token = btoa(`${usernameInput}:${passwordInput}`);
    const header = `Basic ${token}`;

    try {
      // Test the credentials against the API
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 
          "Authorization": header,
          "ngrok-skip-browser-warning": "69420"
        }
      });

      if (res.ok) {
        localStorage.setItem("plu_auth", header);
        setAuthHeader(header);
        setIsAuthenticated(true);
        const data = await res.json();
        setUsers(data);
      } else {
        setLoginError("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่");
      }
    } catch (err) {
      setLoginError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  };

  const handleLogout = () => {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.removeItem("plu_auth");
      setIsAuthenticated(false);
      setAuthHeader("");
      setUsernameInput("");
      setPasswordInput("");
    }
  };

  const fetchUsers = useCallback(async () => {
    if (!authHeader) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 
          "Authorization": authHeader,
          "ngrok-skip-browser-warning": "69420"
        }
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      const interval = setInterval(fetchUsers, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchUsers]);

  const toggleBot = async (platform: string, userId: string, currentIsLocked: boolean) => {
    const willLock = !currentIsLocked;
    
    setUsers((prev) => 
      prev.map(u => (u.platform === platform && u.userId === userId) ? { ...u, isLocked: willLock } : u)
    );

    try {
      await fetch(`${API_BASE}/api/admin/toggle`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": authHeader,
          "ngrok-skip-browser-warning": "69420"
        },
        body: JSON.stringify({ platform, userId, locked: willLock }),
      });
      fetchUsers();
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเปลี่ยนสถานะ");
      fetchUsers(); 
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const name = (u.displayName || "").toLowerCase();
    const id = u.userId.toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  const lineUsers = filteredUsers.filter((u) => u.platform === "line");
  const metaUsers = filteredUsers.filter((u) => u.platform === "meta");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const activeToday = users.filter(u => u.lastActive >= todayStart.getTime());
  const activeTodayLine = activeToday.filter(u => u.platform === 'line').length;
  const activeTodayMeta = activeToday.filter(u => u.platform === 'meta').length;

  // --- LOGIN SCREEN COMPONENT ---
  if (isAuthenticated === false) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#09090b] text-zinc-100' : 'bg-gray-50 text-gray-800'}`}>
        
        {/* Decorative Blurs */}
        <div className={`fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-[0.05] blur-[100px] pointer-events-none ${isDarkMode ? 'bg-[#0668E1]' : 'bg-blue-600'}`}></div>
        <div className={`fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-[0.05] blur-[100px] pointer-events-none ${isDarkMode ? 'bg-[#00B900]' : 'bg-green-500'}`}></div>

        <div className="absolute top-4 right-4">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-yellow-400' : 'bg-white text-gray-400 shadow-sm'}`}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>

        <div className={`w-full max-w-md p-8 sm:p-10 rounded-[2rem] shadow-2xl relative z-10 border ${isDarkMode ? 'bg-[#121214] border-[#27272a] shadow-black/50' : 'bg-white border-white shadow-gray-200/50'}`}>
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src={`${API_BASE}/logo.png`} 
                alt="มหาวิทยาลัยพิษณุโลก PLU" 
                className="h-20 w-auto object-contain drop-shadow-md"
                onError={(e) => {
                  // Fallback if image not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `<div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl ${isDarkMode ? 'bg-zinc-800/80 text-zinc-100' : 'bg-blue-50 text-blue-600'}"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"></path></svg></div>`;
                }}
              />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-2">มหาวิทยาลัยพิษณุโลก</h1>
            <p className={`text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-500'}`}>ลงชื่อเข้าใช้เพื่อเข้าสู่แผงควบคุม</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium">
                {loginError}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Username</label>
              <input 
                type="text" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-xl focus:outline-none transition-all shadow-inner text-sm ${isDarkMode ? 'bg-[#18181b] border border-[#27272a] text-zinc-100 placeholder-zinc-600 focus:ring-1 focus:ring-white/30 focus:border-white/30' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:bg-white'}`}
                placeholder="กรอกชื่อผู้ใช้..."
              />
            </div>

            <div className="space-y-1.5">
              <label className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  required
                  className={`w-full pl-4 pr-12 py-3 rounded-xl focus:outline-none transition-all shadow-inner text-sm ${isDarkMode ? 'bg-[#18181b] border border-[#27272a] text-zinc-100 placeholder-zinc-600 focus:ring-1 focus:ring-white/30 focus:border-white/30' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:bg-white'}`}
                  placeholder="กรอกรหัสผ่าน..."
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`w-full py-3.5 mt-2 rounded-xl font-bold tracking-wide transition-all shadow-lg ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- DASHBOARD COMPONENT ---
  const UserCard = ({ user }: { user: User }) => {
    const isBotOn = !user.isLocked;
    const timeStr = new Date(user.lastActive).toLocaleTimeString("th-TH");
    const name = user.displayName || `ID: ${user.userId.substring(0, 10)}...`;

    return (
      <div className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border rounded-[20px] transition-all duration-300 overflow-hidden ${isDarkMode ? 'bg-[#121214] border-[#27272a] hover:bg-[#18181b] hover:border-[#3f3f46]' : 'bg-white border-gray-100 hover:border-blue-100 hover:shadow-md shadow-sm'}`}>
        
        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px] transition-colors duration-300 ${user.platform === 'line' ? (isDarkMode ? 'bg-green-500/30 group-hover:bg-green-500' : 'bg-green-400') : (isDarkMode ? 'bg-blue-500/30 group-hover:bg-blue-500' : 'bg-blue-500')}`}></div>

        <div className="flex-1 overflow-hidden pl-3 pr-4 z-10 w-full mb-4 sm:mb-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className={`font-bold truncate text-base ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{name}</h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${isDarkMode ? 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>#{user.userId.substring(0, 8)}</span>
          </div>
          <p className={`text-sm truncate mb-2 ${isDarkMode ? 'text-zinc-400 font-light' : 'text-gray-600'}`}>"{user.lastMessage}"</p>
          <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
            <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ล่าสุดเมื่อ {timeStr}
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2.5 shrink-0 z-10 w-full sm:w-auto">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isBotOn} 
              onChange={() => toggleBot(user.platform, user.userId, user.isLocked)} 
            />
            <div className={`w-12 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${isDarkMode ? 'bg-zinc-700 after:bg-zinc-300 after:border-zinc-300 peer-checked:bg-blue-600 peer-checked:after:bg-white' : 'bg-gray-300 after:bg-white after:border-gray-300 peer-checked:bg-blue-500 shadow-inner'}`}></div>
          </label>
          <span className={`text-[10px] px-3 py-1 rounded-full font-bold tracking-widest uppercase transition-all duration-300 ${isBotOn ? (isDarkMode ? 'bg-[#00B900]/10 text-[#00B900] border border-[#00B900]/20' : 'bg-green-50 text-green-600 border border-green-100') : (isDarkMode ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' : 'bg-red-50 text-red-600 border border-red-100')}`}>
            {isBotOn ? '🤖 บอททำงาน' : '👤 แอดมินตอบ'}
          </span>
        </div>
      </div>
    );
  };

  if (isAuthenticated === null) return null; // Hydration gap

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#09090b] text-zinc-100 selection:bg-white/20 selection:text-white' : 'bg-gray-50 text-gray-800 selection:bg-blue-200 selection:text-gray-900'}`}>
      
      {/* Decorative Blur Elements (Dark mode only) */}
      {isDarkMode && (
        <>
          <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-500 opacity-[0.03] blur-[120px] pointer-events-none"></div>
          <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600 opacity-[0.04] blur-[120px] pointer-events-none"></div>
        </>
      )}

      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 relative z-10">
        
        {/* Header Section */}
        <header className={`flex flex-col md:flex-row justify-between items-center gap-6 p-6 rounded-[2rem] shadow-sm transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-r from-zinc-900 to-[#121214] border border-white/5' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'}`}>
          <div className="w-full md:w-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <img 
                  src={`${API_BASE}/logo.png`} 
                  alt="มหาวิทยาลัยพิษณุโลก" 
                  className={`h-12 w-auto object-contain ${!isDarkMode && 'brightness-0 invert drop-shadow-md'}`}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <h1 className="text-2xl font-extrabold tracking-tight hidden sm:block">มหาวิทยาลัยพิษณุโลก PLU</h1>
              </div>
              
              {/* Controls (Mobile visible) */}
              <div className="flex md:hidden gap-2">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-full ${isDarkMode ? 'bg-zinc-800 text-yellow-400' : 'bg-white/20 text-white'}`}>
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                <button onClick={handleLogout} className={`p-2 rounded-full ${isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-500/20 text-white'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </div>
            </div>
            <p className={`font-medium ${isDarkMode ? 'text-zinc-500' : 'text-blue-100 opacity-90'}`}>ระบบแผงควบคุมแชทบอท และสลับการทำงาน</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Box */}
            <div className="relative w-full sm:w-72 group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className={`w-4 h-4 ${isDarkMode ? 'text-zinc-500 group-focus-within:text-zinc-200' : 'text-white/70 group-focus-within:text-white'} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อ หรือ ID..."
                className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none transition-all shadow-inner text-sm ${isDarkMode ? 'bg-[#18181b] border border-[#27272a] text-zinc-100 placeholder-zinc-600 focus:ring-1 focus:ring-white/30 focus:border-white/30' : 'bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/50 focus:bg-white/20'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Controls (Desktop visible) */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}
                title={isDarkMode ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                )}
              </button>
              
              <button 
                onClick={handleLogout} 
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${isDarkMode ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10'}`}
                title="ออกจากระบบ"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span>ออก</span>
              </button>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className={`p-6 rounded-3xl border flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 ${isDarkMode ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/50' : 'bg-indigo-50 text-indigo-600'}`}>
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>ผู้ใช้งานวันนี้ทั้งหมด</p>
              <h3 className={`text-3xl font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{activeToday.length} <span className={`text-base font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>คน</span></h3>
            </div>
          </div>
          
          <div className={`p-6 rounded-3xl border flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 ${isDarkMode ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#00B900]/10 text-[#00B900] border border-[#00B900]/20' : 'bg-green-50 text-green-500'}`}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 3.263 8.846 7.859 9.605.308.064.721.196.827.45.096.233.032.597.014.821-.027.351-.131 1.05-.157 1.258-.044.331.18.528.486.357 1.265-.705 4.826-2.909 6.837-5.068C21.724 15.539 24 13.067 24 10.304z" /></svg>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>ทักมาจาก LINE</p>
              <h3 className={`text-3xl font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{activeTodayLine} <span className={`text-base font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>คน</span></h3>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300 ${isDarkMode ? 'bg-[#121214] border-[#27272a]' : 'bg-white border-gray-100 shadow-sm'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#0668E1]/10 text-[#0668E1] border border-[#0668E1]/20' : 'bg-blue-50 text-blue-600'}`}>
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M23.998 11.999C23.998 5.372 18.626 0 11.999 0 5.372 0 0 5.372 0 11.999c0 5.989 4.388 10.954 10.124 11.854v-8.384H7.078v-3.47h3.046V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 22.953 23.998 17.988 23.998 11.999z"/></svg>
            </div>
            <div>
              <p className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>ทักมาจาก Facebook</p>
              <h3 className={`text-3xl font-extrabold ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>{activeTodayMeta} <span className={`text-base font-medium ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>คน</span></h3>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading && users.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-20 ${isDarkMode ? 'text-zinc-500' : 'text-blue-500'}`}>
            <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className={`font-semibold animate-pulse ${isDarkMode ? 'text-zinc-600' : 'text-gray-500'}`}>กำลังโหลดข้อมูลล่าสุด...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
            
            {/* LINE Column */}
            <div className="flex flex-col">
              <div className={`flex items-center justify-between mb-5 pb-3 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-[#00B900] shadow-[0_0_8px_#00B900]' : 'bg-green-500'}`}></div>
                  <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>ลูกค้าระบบ LINE</h2>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-green-100 text-green-700'}`}>
                  {lineUsers.length} คน
                </span>
              </div>
              <div className="space-y-4">
                {lineUsers.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-16 border border-dashed rounded-[24px] ${isDarkMode ? 'bg-[#121214]/50 border-[#27272a]' : 'bg-white border-gray-200'}`}>
                    <svg className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    <p className={`font-medium text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>ไม่มีข้อมูลรายชื่อ</p>
                  </div>
                ) : (
                  lineUsers.map((u) => <UserCard key={u.userId} user={u} />)
                )}
              </div>
            </div>

            {/* Facebook Column */}
            <div className="flex flex-col">
              <div className={`flex items-center justify-between mb-5 pb-3 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-[#0668E1] shadow-[0_0_8px_#0668E1]' : 'bg-blue-600'}`}></div>
                  <h2 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-zinc-100' : 'text-gray-800'}`}>ลูกค้าระบบ Facebook</h2>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isDarkMode ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-blue-100 text-blue-700'}`}>
                  {metaUsers.length} คน
                </span>
              </div>
              <div className="space-y-4">
                {metaUsers.length === 0 ? (
                  <div className={`flex flex-col items-center justify-center py-16 border border-dashed rounded-[24px] ${isDarkMode ? 'bg-[#121214]/50 border-[#27272a]' : 'bg-white border-gray-200'}`}>
                    <svg className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-zinc-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    <p className={`font-medium text-sm ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`}>ไม่มีข้อมูลรายชื่อ</p>
                  </div>
                ) : (
                  metaUsers.map((u) => <UserCard key={u.userId} user={u} />)
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
