import React from 'react';

interface BrowserMockupProps {
  className?: string;
}

export const BrowserMockup: React.FC<BrowserMockupProps> = ({ className }) => {
  return (
    <div className={`w-full rounded-lg overflow-hidden shadow-xl border border-gray-200 ${className}`}>
      {/* Browser Chrome */}
      <div className="bg-gray-100 border-b border-gray-200 flex flex-col">
        {/* Tab Bar */}
        <div className="flex items-center px-2 pt-1.5">
          {/* Browser Controls */}
          <div className="flex items-center gap-1.5 mr-4 pl-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center">
            <div className="flex items-center bg-white border-t border-l border-r border-gray-200 rounded-t-md py-1.5 px-4 text-sm font-medium text-gray-800">
              <div className="w-4 h-4 mr-2 rounded-full bg-[#0F4C81]"></div>
              ALU Student Assistant
            </div>
            <div className="flex items-center bg-gray-100 border-t border-l border-r border-gray-200/50 rounded-t-md py-1.5 px-4 text-sm font-medium text-gray-500">
              ALU Portal
            </div>
          </div>
        </div>
        
        {/* URL Bar */}
        <div className="flex items-center px-4 py-1.5 pb-2">
          <div className="flex items-center gap-2 mr-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </div>
          <div className="flex-1 bg-white border border-gray-200 rounded-full py-1 px-3 flex items-center text-sm text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock mr-2 text-gray-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            alu-assistant.education
          </div>
          <div className="ml-3 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </div>
        </div>
      </div>
      
      {/* Browser Content */}
      <div className="bg-white p-4 h-64 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-100 p-3 hidden md:block">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-md bg-[#0F4C81] flex items-center justify-center text-white font-bold text-xs">A</div>
                <span className="ml-2 font-medium text-gray-800">ALU Assistant</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="px-2 py-1.5 bg-[#0F4C81]/10 rounded text-[#0F4C81] text-sm font-medium">Dashboard</div>
              <div className="px-2 py-1.5 text-gray-600 text-sm">Conversations</div>
              <div className="px-2 py-1.5 text-gray-600 text-sm">Resources</div>
              <div className="px-2 py-1.5 text-gray-600 text-sm">Settings</div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* Chat Interface */}
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden p-3">
                {/* Messages */}
                <div className="flex mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#0F4C81] flex items-center justify-center text-white font-bold text-xs">A</div>
                  <div className="ml-3 bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">Welcome to ALU Student Assistant! How can I help you today?</p>
                  </div>
                </div>
                <div className="flex justify-end mb-4">
                  <div className="bg-[#0F4C81]/10 rounded-lg p-3 max-w-[80%] mr-3">
                    <p className="text-sm">Can I graduate in absentia at ALU?</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">U</div>
                </div>
                <div className="flex mb-4">
                  <div className="w-8 h-8 rounded-full bg-[#0F4C81] flex items-center justify-center text-white font-bold text-xs">A</div>
                  <div className="ml-3 bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">🎓 Yes! You can graduate in absentia at ALU. Submit the "Graduation in Absentia Form" at least 30 days before the ceremony to the Registrar's Office. Your diploma will still be processed on the same timeline.</p>
                  </div>
                </div>
              </div>
              
              {/* Input Area */}
              <div className="border-t border-gray-100 p-3">
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
                  <input type="text" className="flex-1 bg-transparent border-none outline-none text-sm" placeholder="Ask anything about ALU..." />
                  <button className="ml-2 w-8 h-8 rounded-full bg-[#0F4C81] flex items-center justify-center text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4L22 2z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};