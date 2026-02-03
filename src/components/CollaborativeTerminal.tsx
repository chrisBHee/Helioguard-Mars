'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Share2, UserPlus, LogOut } from 'lucide-react';
import { collaborationService } from '@/services/collaboration-service';

interface CollaborativeTerminalProps {
  sessionId?: string;
  currentUser: { userId: string; username: string; role: string };
}

export function CollaborativeTerminal({ sessionId, currentUser }: CollaborativeTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const inputBufferRef = useRef('');
  const cursorPositionRef = useRef(0);
  
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    initializeTerminal();
    initializeCollaboration();
    
    return () => {
      cleanupTerminal();
      collaborationService.leaveSession(currentUser.userId);
    };
  }, []);

  const initializeTerminal = () => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#FF8C00',
        black: '#000000',
        red: '#ff5555',
        green: '#50fa7b',
        yellow: '#f1fa8c',
        blue: '#bd93f9',
        magenta: '#ff79c6',
        cyan: '#8be9fd',
        white: '#ffffff',
        brightBlack: '#555555',
        brightRed: '#ff5555',
        brightGreen: '#50fa7b',
        brightYellow: '#f1fa8c',
        brightBlue: '#bd93f9',
        brightMagenta: '#ff79c6',
        brightCyan: '#8be9fd',
        brightWhite: '#ffffff'
      },
      fontFamily: 'monospace',
      fontSize: 14,
      cursorBlink: true,
      scrollback: 1000,
      tabStopWidth: 4
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Welcome message
    term.writeln('\x1b[1;32m=== HELIOGUARD COLLABORATIVE TERMINAL ===\x1b[0m');
    term.writeln(`\x1b[36mSession: ${sessionId || 'Main Control'}\x1b[0m`);
    term.writeln(`\x1b[36mUser: ${currentUser.username} (${currentUser.role})\x1b[0m`);
    term.writeln('\x1b[36mConnected users: Type "users" to see participants\x1b[0m');
    term.writeln('');
    term.write('\x1b[1;32mmars-colonist@helio-guard:~$ \x1b[0m');

    term.onData((data) => {
      handleTerminalInput(data, term);
    });

    // Handle window resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  const initializeCollaboration = async () => {
    if (sessionId) {
      await collaborationService.joinSharedSession(sessionId, currentUser.userId);
    }

    // Subscribe to collaboration messages
    const unsubscribe = collaborationService.subscribeToMessages((message) => {
      if (message.sessionId === sessionId) {
        handleCollaborationMessage(message);
      }
    });

    // Update session info periodically
    const interval = setInterval(() => {
      if (sessionId) {
        const status = collaborationService.getSessionStatus(sessionId);
        setSessionInfo(status);
        
        const sessionParticipants = collaborationService.getSessionParticipants(sessionId);
        setParticipants(sessionParticipants);
        
        const recentMessages = collaborationService.getSessionMessages(sessionId, 20);
        setMessages(recentMessages);
      }
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  };

  const handleTerminalInput = async (data: string, term: Terminal): Promise<void> => {
    if (data === '\r') { // Enter key
      term.writeln('');
      
      if (inputBufferRef.current.trim()) {
        const [command, ...args] = inputBufferRef.current.trim().split(' ');
        await executeCommand(command, args, term);
      }
      
      inputBufferRef.current = '';
      cursorPositionRef.current = 0;
      term.write('\x1b[1;32mmars-colonist@helio-guard:~$ \x1b[0m');
      
    } else if (data === '\u007f' || data === '\b') { // Backspace
      if (cursorPositionRef.current > 0 && inputBufferRef.current.length > 0) {
        const beforeCursor = inputBufferRef.current.slice(0, cursorPositionRef.current - 1);
        const afterCursor = inputBufferRef.current.slice(cursorPositionRef.current);
        inputBufferRef.current = beforeCursor + afterCursor;
        cursorPositionRef.current--;
        
        term.write('\b');
        term.write(inputBufferRef.current.slice(cursorPositionRef.current) + ' ');
        for (let i = 0; i < inputBufferRef.current.length - cursorPositionRef.current; i++) {
          term.write('\x1b[D');
        }
      }
      
    } else if (data.charCodeAt(0) >= 32 && data.charCodeAt(0) <= 126) { // Printable characters
      const beforeCursor = inputBufferRef.current.slice(0, cursorPositionRef.current);
      const afterCursor = inputBufferRef.current.slice(cursorPositionRef.current);
      inputBufferRef.current = beforeCursor + data + afterCursor;
      cursorPositionRef.current++;
      
      term.write(data);
      if (afterCursor) {
        term.write(afterCursor);
        for (let i = 0; i < afterCursor.length; i++) {
          term.write('\x1b[D');
        }
      }
    }
  };

  const executeCommand = async (command: string, args: string[], term: Terminal): Promise<void> => {
    switch (command.toLowerCase()) {
      case 'users':
        await handleUsersCommand(term);
        break;
      case 'chat':
        setShowChat(!showChat);
        term.writeln(showChat ? 'Chat panel hidden' : 'Chat panel opened');
        break;
      case 'share':
        await handleShareCommand(args, term);
        break;
      case 'msg':
        await handleSendMessage(args, term);
        break;
      case 'status':
        await handleStatusCommand(term);
        break;
      default:
        // Pass unknown commands to main terminal
        term.writeln(`\x1b[31mUnknown collaborative command: ${command}\x1b[0m`);
        term.writeln('Available collaborative commands:');
        term.writeln('  users    - Show session participants');
        term.writeln('  chat     - Toggle chat panel');
        term.writeln('  share    - Share current session');
        term.writeln('  msg      - Send message to session');
        term.writeln('  status   - Show session status');
    }
  };

  const handleUsersCommand = async (term: Terminal): Promise<void> => {
    term.writeln('\x1b[1;36m=== SESSION PARTICIPANTS ===\x1b[0m');
    
    participants.forEach((user, index) => {
      const roleColor = user.role === 'administrator' ? '\x1b[31m' : 
                       user.role === 'operator' ? '\x1b[32m' : 
                       user.role === 'scientist' ? '\x1b[33m' : '\x1b[36m';
      
      term.writeln(`${(index + 1).toString().padEnd(2)} ${roleColor}${user.username}\x1b[0m (${user.role})`);
      term.writeln(`   Location: ${user.currentLocation}`);
      term.writeln(`   Active: ${Math.floor((Date.now() - user.lastActivity.getTime()) / 60000)} minutes ago`);
    });
    
    term.writeln(`\x1b[1;32mTotal participants: ${participants.length}\x1b[0m`);
  };

  const handleShareCommand = async (args: string[], term: Terminal): Promise<void> => {
    if (args.length === 0) {
      term.writeln('\x1b[31mUsage: share <username>\x1b[0m');
      return;
    }

    const targetUser = args[0];
    term.writeln(`\x1b[36mSharing session with ${targetUser}...\x1b[0m`);
    
    // Simulate sharing
    setTimeout(() => {
      term.writeln(`\x1b[32mSession shared with ${targetUser}\x1b[0m`);
      
      // Send collaboration message
      collaborationService.sendMessage({
        senderId: currentUser.userId,
        senderName: currentUser.username,
        messageType: 'notification',
        content: { text: `Shared session with ${targetUser}` },
        sessionId: sessionId || '',
        priority: 'normal'
      });
    }, 1000);
  };

  const handleSendMessage = async (args: string[], term: Terminal): Promise<void> => {
    if (args.length === 0) {
      term.writeln('\x1b[31mUsage: msg <message>\x1b[0m');
      return;
    }

    const messageText = args.join(' ');
    
    try {
      await collaborationService.sendMessage({
        senderId: currentUser.userId,
        senderName: currentUser.username,
        messageType: 'chat',
        content: { text: messageText },
        sessionId: sessionId || '',
        priority: 'normal'
      });
      
      term.writeln(`\x1b[32mMessage sent: ${messageText}\x1b[0m`);
    } catch (error) {
      term.writeln('\x1b[31mFailed to send message\x1b[0m');
    }
  };

  const handleStatusCommand = async (term: Terminal): Promise<void> => {
    if (!sessionId) {
      term.writeln('\x1b[31mNo active session\x1b[0m');
      return;
    }

    const status = collaborationService.getSessionStatus(sessionId);
    term.writeln('\x1b[1;36m=== SESSION STATUS ===\x1b[0m');
    term.writeln(`Active Users: ${status.activeUsers}`);
    term.writeln(`Messages: ${status.totalMessages}`);
    term.writeln(`Shared Resources: ${status.resourcesShared}`);
    term.writeln(`Session Uptime: ${status.uptime}`);
  };

  const handleCollaborationMessage = (message: any) => {
    const term = terminalInstanceRef.current;
    if (!term) return;

    const timestamp = message.timestamp.toLocaleTimeString();
    const messageColor = message.priority === 'urgent' ? '\x1b[31m' : 
                        message.priority === 'high' ? '\x1b[33m' : '\x1b[36m';

    switch (message.messageType) {
      case 'chat':
        term.writeln(`\x1b[1;37m[${timestamp}] ${message.senderName}:\x1b[0m ${message.content.text}`);
        break;
      case 'notification':
        term.writeln(`${messageColor}[NOTICE] ${message.content.text}\x1b[0m`);
        break;
      case 'alert':
        term.writeln(`\x1b[1;31m[ALERT] ${message.content.text}\x1b[0m`);
        break;
    }

    // Show prompt again
    term.write('\x1b[1;32mmars-colonist@helio-guard:~$ \x1b[0m');
    term.write(inputBufferRef.current);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !sessionId) return;

    try {
      await collaborationService.sendMessage({
        senderId: currentUser.userId,
        senderName: currentUser.username,
        messageType: 'chat',
        content: { text: chatInput },
        sessionId,
        priority: 'normal'
      });
      
      setChatInput('');
    } catch (error) {
      console.error('Failed to send chat message:', error);
    }
  };

  const cleanupTerminal = () => {
    if (terminalInstanceRef.current) {
      terminalInstanceRef.current.dispose();
      terminalInstanceRef.current = null;
    }
  };

  return (
    <div className="bg-black rounded-xl overflow-hidden border border-orange-500/30">
      {/* Terminal Header with Collaboration Info */}
      <div className="bg-orange-900/20 px-4 py-2 flex items-center justify-between border-b border-orange-500/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-mono">HELIOGUARD COLLABORATIVE TERMINAL</span>
          </div>
          {sessionId && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300">{sessionInfo?.activeUsers || 0} users</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowChat(!showChat)}
            className="p-1 hover:bg-orange-500/20 rounded transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-orange-400" />
          </button>
          <button className="p-1 hover:bg-orange-500/20 rounded transition-colors">
            <Share2 className="w-5 h-5 text-orange-400" />
          </button>
          <button className="p-1 hover:bg-orange-500/20 rounded transition-colors">
            <UserPlus className="w-5 h-5 text-orange-400" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Main Terminal */}
        <div className="flex-1" ref={terminalRef} />

        {/* Chat Sidebar */}
        {showChat && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            className="w-75 border-l border-orange-500/30 bg-gray-900/50 flex flex-col"
          >
            {/* Chat Header */}
            <div className="p-3 border-b border-orange-500/30">
              <h3 className="text-orange-400 font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Session Chat
              </h3>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              {messages.map((msg) => (
                <div key={msg.messageId} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-400 font-medium">{msg.senderName}</span>
                    <span className="text-gray-500 text-xs">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-300 ml-2">{msg.content.text}</div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-orange-500/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-orange-500/30 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-orange-400"
                />
                <button
                  onClick={sendChatMessage}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TerminalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="15" rx="2" ry="2" />
      <line x1="2" y1="18" x2="22" y2="18" />
      <line x1="6" y1="21" x2="8" y2="21" />
      <line x1="16" y1="21" x2="18" y2="21" />
    </svg>
  );
}