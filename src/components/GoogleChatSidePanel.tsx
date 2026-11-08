import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CosmosGameState } from '../types/cosmos';
import {
  MessageSquare,
  Send,
  RefreshCw,
  LogIn,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  X,
  Zap,
} from 'lucide-react';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// In-memory Google Workspace OAuth access token cache per workspace-integration skill
let cachedChatAccessToken: string | null = null;

const CHAT_SCOPES = [
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.messages.readonly',
];

interface GoogleChatSpace {
  name: string; // e.g. "spaces/AAAA..."
  displayName?: string;
  spaceType?: string;
}

interface GoogleChatMessage {
  name: string;
  text: string;
  createTime?: string;
  sender?: {
    displayName?: string;
    name?: string;
    type?: string;
  };
}

interface LocalNegotiationProposal {
  id: string;
  player: 'player1' | 'player2';
  author: string;
  activeMove: string;
  passiveMove: string;
  note: string;
  timestamp: string;
  source: 'google_chat' | 'tactical_relay';
}

interface GoogleChatSidePanelProps {
  gameState: CosmosGameState;
  isOpen: boolean;
  onClose: () => void;
  p1Active: string;
  p1Passive: string;
  p2Active: string;
  p2Passive: string;
  onApplyNegotiatedMove: (
    player: 'player1' | 'player2',
    activeMove: string,
    passiveMove: string
  ) => void;
}

export const GoogleChatSidePanel: React.FC<GoogleChatSidePanelProps> = ({
  gameState,
  isOpen,
  onClose,
  p1Active,
  p1Passive,
  p2Active,
  p2Passive,
  onApplyNegotiatedMove,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [hasToken, setHasToken] = useState<boolean>(Boolean(cachedChatAccessToken));
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<GoogleChatMessage[]>([]);
  const [loadingSpaces, setLoadingSpaces] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [apiError, setApiError] = useState<{
    title: string;
    detail: string;
    isChatAppUnconfigured?: boolean;
  } | null>(null);

  // Move Negotiation Composer State
  const [negotiatingPlayer, setNegotiatingPlayer] = useState<'player1' | 'player2'>(
    gameState.activePlayerTurn
  );
  const [draftActive, setDraftActive] = useState<string>(p1Active);
  const [draftPassive, setDraftPassive] = useState<string>(p1Passive);
  const [draftNote, setDraftNote] = useState<string>(
    'Let us coordinate this move so Entropy cannot exploit a square-wheel or deforestation loophole!'
  );

  // Mandatory User Confirmation Modal before mutating Google Chat (creating/sending message)
  const [pendingConfirmationPayload, setPendingConfirmationPayload] = useState<{
    spaceName: string;
    formattedText: string;
    player: 'player1' | 'player2';
    activeMove: string;
    passiveMove: string;
    note: string;
  } | null>(null);
  const [sendingToGoogleChat, setSendingToGoogleChat] = useState<boolean>(false);

  // Local + Google Chat synchronized negotiation feed
  const [proposals, setProposals] = useState<LocalNegotiationProposal[]>([
    {
      id: 'prop-init-1',
      player: 'player1',
      author: 'Commander I (Architect)',
      activeMove:
        'Invent a round wooden wheel on a greased iron axle attached to timber carts',
      passiveMove: 'Sustainable reforestation (replant 2 saplings per tree cut)',
      note: 'Specified ROUND wheel + axle + reforestation so Player 2 cannot make square wheels and Entropy cannot Easter-Island our trees!',
      timestamp: '00:01',
      source: 'tactical_relay',
    },
    {
      id: 'prop-init-2',
      player: 'player2',
      author: 'Commander II (Weaver)',
      activeMove:
        'Evolve 3-Cone eyes (Red-in-the-middle cheat) + Rhodopsin Rods for night stargazing',
      passiveMove: 'Buoyant 1.45G atmosphere for Hitchhiker’s Guide Sky Whales',
      note: 'Includes Rods so our colonists never suffer Kokošja Slepota (night blindness)!',
      timestamp: '00:02',
      source: 'tactical_relay',
    },
  ]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
    });
    return () => unsub();
  }, []);

  // Sync draft fields when switching player tab
  const handleSelectPlayerTab = (pl: 'player1' | 'player2') => {
    setNegotiatingPlayer(pl);
    if (pl === 'player1') {
      setDraftActive(p1Active);
      setDraftPassive(p1Passive);
    } else {
      setDraftActive(p2Active);
      setDraftPassive(p2Passive);
    }
  };

  const authenticateGoogleChat = async (): Promise<string | null> => {
    setApiError(null);
    try {
      const provider = new GoogleAuthProvider();
      CHAT_SCOPES.forEach((s) => provider.addScope(s));
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken || null;
      cachedChatAccessToken = token;
      setHasToken(Boolean(token));
      return token;
    } catch (err) {
      setApiError({
        title: 'Google Workspace OAuth Sign-In Canceled or Blocked',
        detail: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  };

  const fetchChatSpaces = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || cachedChatAccessToken;
    if (!token) return;
    setLoadingSpaces(true);
    setApiError(null);

    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces?pageSize=20', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        cachedChatAccessToken = null;
        setHasToken(false);
        setApiError({
          title: 'Google Chat Token Expired',
          detail: 'Please click Reconnect Google Chat to refresh your OAuth token.',
        });
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        const isNotFound =
          res.status === 404 ||
          msg.toLowerCase().includes('chat app not found') ||
          msg.toLowerCase().includes('configure the app');
        setApiError({
          title: isNotFound
            ? 'Google Chat App Configuration Required (One-Time Console Step)'
            : 'Google Chat API Notice',
          detail: msg,
          isChatAppUnconfigured: isNotFound,
        });
        return;
      }

      const loadedSpaces: GoogleChatSpace[] = data.spaces || [];
      setSpaces(loadedSpaces);
      if (loadedSpaces.length > 0 && !selectedSpace) {
        setSelectedSpace(loadedSpaces[0].name);
      }
    } catch (err) {
      setApiError({
        title: 'Network Error Contacting chat.googleapis.com',
        detail: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoadingSpaces(false);
    }
  }, [selectedSpace]);

  const fetchSpaceMessages = useCallback(async (spaceName: string) => {
    const token = cachedChatAccessToken;
    if (!token || !spaceName) return;
    setLoadingMessages(true);

    try {
      const res = await fetch(
        `https://chat.googleapis.com/v1/${spaceName}/messages?pageSize=15`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        setApiError({
          title: 'Could Not Load Space Messages',
          detail: msg,
          isChatAppUnconfigured: res.status === 404,
        });
        return;
      }
      const msgs: GoogleChatMessage[] = data.messages || [];
      setChatMessages(msgs);
    } catch (err) {
      setApiError({
        title: 'Failed to Read Messages',
        detail: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSpace && cachedChatAccessToken) {
      fetchSpaceMessages(selectedSpace);
    }
  }, [selectedSpace, fetchSpaceMessages]);

  const handleConnectClick = async () => {
    const token = await authenticateGoogleChat();
    if (token) {
      await fetchChatSpaces(token);
    }
  };

  // Stage a move proposal (opens confirmation modal if sending to real Google Chat space)
  const handleStageMoveProposal = (sendToGoogleSpace: boolean) => {
    const formattedText = [
      `⚡ *[SATISFRACTURED · PHASE ${gameState.phase} MOVE PROPOSAL — ${
        negotiatingPlayer === 'player1' ? 'PLAYER 1' : 'PLAYER 2'
      }]*`,
      `• *ACTIVE MOVE*: ${draftActive.trim() || '(None)'}`,
      `• *PASSIVE LAW*: ${draftPassive.trim() || '(None)'}`,
      `• *TACTICAL NOTE*: ${draftNote.trim()}`,
      `_(No Backsies! Entropy Index: ${gameState.entropyIndex}%)_`,
    ].join('\n');

    if (sendToGoogleSpace && selectedSpace && cachedChatAccessToken) {
      // Mandatory user confirmation before mutating external Google Chat workspace data!
      setPendingConfirmationPayload({
        spaceName: selectedSpace,
        formattedText,
        player: negotiatingPlayer,
        activeMove: draftActive.trim(),
        passiveMove: draftPassive.trim(),
        note: draftNote.trim(),
      });
    } else {
      // Post directly to the in-dock Tactical Comms stream & apply option
      const newProp: LocalNegotiationProposal = {
        id: `prop-${Date.now()}`,
        player: negotiatingPlayer,
        author:
          currentUser?.displayName ||
          (negotiatingPlayer === 'player1' ? 'Player 1 Commander' : 'Player 2 Commander'),
        activeMove: draftActive.trim(),
        passiveMove: draftPassive.trim(),
        note: draftNote.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'tactical_relay',
      };
      setProposals((prev) => [newProp, ...prev]);
    }
  };

  const handleConfirmPostToGoogleChat = async () => {
    if (!pendingConfirmationPayload || !cachedChatAccessToken) return;
    setSendingToGoogleChat(true);
    setApiError(null);

    try {
      const res = await fetch(
        `https://chat.googleapis.com/v1/${pendingConfirmationPayload.spaceName}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${cachedChatAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: pendingConfirmationPayload.formattedText,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || `HTTP ${res.status}`;
        setApiError({
          title: 'Failed to Post Message to Google Chat Space',
          detail: msg,
          isChatAppUnconfigured: res.status === 404,
        });
      } else {
        // Also mirror into our negotiation feed and refresh space messages
        setProposals((prev) => [
          {
            id: `gchat-${Date.now()}`,
            player: pendingConfirmationPayload.player,
            author: currentUser?.displayName || 'Google Chat Commander',
            activeMove: pendingConfirmationPayload.activeMove,
            passiveMove: pendingConfirmationPayload.passiveMove,
            note: pendingConfirmationPayload.note,
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            source: 'google_chat',
          },
          ...prev,
        ]);
        await fetchSpaceMessages(pendingConfirmationPayload.spaceName);
      }
    } catch (err) {
      setApiError({
        title: 'Error Posting to Google Chat API',
        detail: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSendingToGoogleChat(false);
      setPendingConfirmationPayload(null);
    }
  };

  if (!isOpen) return null;

  const consoleConfigUrl = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${firebaseConfig.projectId}`;

  return (
    <aside className="fixed right-3 bottom-3 top-14 z-30 w-[94vw] max-w-[410px] flex flex-col bg-[#060B09]/98 border-2 border-[#22C55E]/70 rounded-sm shadow-2xl font-mono text-xs pointer-events-auto overflow-hidden">
      {/* Top StarCraft 1 Comms Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0B1712] border-b border-[#22C55E]/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#22C55E]" />
          <div>
            <div className="font-bold text-[#22C55E] uppercase tracking-wider text-xs">
              Google Chat Diplomatic Comms
            </div>
            <div className="text-[10px] text-slate-400">
              Active / Passive Move Negotiation Channel
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white bg-[#11221B] border border-[#22C55E]/40 rounded-sm cursor-pointer"
          title="Close Google Chat Comms Panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Google Workspace OAuth & Space Connection Bar */}
        <div className="p-2.5 bg-[#09120E] border border-[#1E3A2F] rounded-sm space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-200">
                {currentUser && hasToken
                  ? `Connected: ${currentUser.email || currentUser.displayName}`
                  : 'Google Workspace Chat API'}
              </span>
            </div>

            <button
              type="button"
              onClick={handleConnectClick}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#22C55E]/20 hover:bg-[#22C55E]/35 text-[#22C55E] border border-[#22C55E]/60 rounded-sm text-[10px] font-bold uppercase cursor-pointer shrink-0"
            >
              <LogIn className="w-3 h-3" />
              <span>{hasToken ? 'Reconnect OAuth' : 'Connect Google Chat'}</span>
            </button>
          </div>

          {/* Prerequisite Notice per workspace-integration/references/chat.md */}
          <div className="text-[10px] text-slate-400 leading-relaxed font-sans bg-black/50 p-2 rounded-sm border border-slate-800">
            <strong className="text-amber-300 font-mono">Prerequisites:</strong> Live{' '}
            <code className="text-emerald-300">chat.googleapis.com</code> calls require a{' '}
            <strong>Google Workspace (Business/Enterprise)</strong> account and a configured{' '}
            <a
              href={consoleConfigUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 underline inline-flex items-center gap-0.5"
            >
              <span>Cloud Console Chat App</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
            .
          </div>

          {/* Space Selector when authenticated */}
          {hasToken && (
            <div className="flex items-center gap-1.5 pt-1">
              <select
                value={selectedSpace}
                onChange={(e) => setSelectedSpace(e.target.value)}
                className="flex-1 bg-[#040806] border border-[#1E3A2F] rounded-sm px-2 py-1 text-[11px] text-emerald-200 focus:outline-none focus:border-[#22C55E]"
              >
                <option value="">
                  {loadingSpaces
                    ? 'Loading Google Chat Spaces...'
                    : spaces.length === 0
                      ? 'No Google Chat Spaces found (Use Tactical Relay below)'
                      : 'Select Google Chat Space...'}
                </option>
                {spaces.map((sp) => (
                  <option key={sp.name} value={sp.name}>
                    {sp.displayName || sp.name} ({sp.spaceType || 'SPACE'})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => fetchChatSpaces()}
                disabled={loadingSpaces}
                className="p-1.5 bg-[#0D1C15] hover:bg-[#152E23] text-emerald-300 border border-[#1E3A2F] rounded-sm cursor-pointer"
                title="Refresh Google Chat Spaces"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSpaces ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {/* API Error / 404 Chat App Configuration Guidance */}
          {apiError && (
            <div className="p-2 bg-rose-950/60 border border-rose-500/60 rounded-sm space-y-1 text-[10px]">
              <div className="flex items-center gap-1 text-rose-300 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{apiError.title}</span>
              </div>
              <p className="text-rose-200/90 font-sans leading-snug">{apiError.detail}</p>
              {apiError.isChatAppUnconfigured && (
                <a
                  href={consoleConfigUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-400/50 rounded-sm hover:bg-amber-500/30"
                >
                  <span>Open Google Chat API Configuration ({firebaseConfig.projectId})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Active / Passive Move Negotiation Composer */}
        <div className="p-2.5 bg-[#09120E] border border-[#22C55E]/40 rounded-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-300 uppercase">
              Propose Turn #{gameState.globalTurn} Move
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSelectPlayerTab('player1')}
                className={`px-2 py-0.5 text-[10px] rounded-sm border cursor-pointer ${
                  negotiatingPlayer === 'player1'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                    : 'bg-black/50 text-slate-400 border-slate-700'
                }`}
              >
                P1 (Architect)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPlayerTab('player2')}
                className={`px-2 py-0.5 text-[10px] rounded-sm border cursor-pointer ${
                  negotiatingPlayer === 'player2'
                    ? 'bg-cyan-400 text-slate-950 font-bold border-cyan-300'
                    : 'bg-black/50 text-slate-400 border-slate-700'
                }`}
              >
                P2 (Weaver)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div>
              <label className="block text-[10px] text-emerald-300 mb-0.5">
                Proposed ACTIVE Action (1 Move = 1 Active + 1 Passive):
              </label>
              <input
                type="text"
                value={draftActive}
                onChange={(e) => setDraftActive(e.target.value)}
                placeholder="e.g., Build round-wheeled timber wagons with greased axles..."
                className="w-full px-2 py-1 bg-[#040806] border border-[#1E3A2F] rounded-sm text-slate-100 text-[11px] focus:outline-none focus:border-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-cyan-300 mb-0.5">
                Proposed PASSIVE Law / Constraint:
              </label>
              <input
                type="text"
                value={draftPassive}
                onChange={(e) => setDraftPassive(e.target.value)}
                placeholder="e.g., Replant 2 trees for every tree cut to block Entropy..."
                className="w-full px-2 py-1 bg-[#040806] border border-[#1E3A2F] rounded-sm text-slate-100 text-[11px] focus:outline-none focus:border-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-0.5">
                Diplomatic / Loophole Warning Note:
              </label>
              <input
                type="text"
                value={draftNote}
                onChange={(e) => setDraftNote(e.target.value)}
                placeholder="Negotiate loophole truce or synergy with your co-player..."
                className="w-full px-2 py-1 bg-[#040806] border border-[#1E3A2F] rounded-sm text-slate-300 text-[11px] focus:outline-none focus:border-[#22C55E]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleStageMoveProposal(false)}
              className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-[#22C55E]/20 hover:bg-[#22C55E]/35 text-[#22C55E] border border-[#22C55E]/60 rounded-sm font-bold uppercase text-[10px] cursor-pointer"
            >
              <Send className="w-3 h-3" />
              <span>Post to Tactical Stream</span>
            </button>

            {hasToken && selectedSpace && (
              <button
                type="button"
                onClick={() => handleStageMoveProposal(true)}
                className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-400/60 rounded-sm font-bold uppercase text-[10px] cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Send to Google Chat</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Google Chat Space Messages (if a space is selected) */}
        {hasToken && selectedSpace && (
          <div className="p-2.5 bg-[#09120E] border border-[#1E3A2F] rounded-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-cyan-300">
                Live Google Chat Space Stream ({chatMessages.length})
              </span>
              <button
                type="button"
                onClick={() => fetchSpaceMessages(selectedSpace)}
                disabled={loadingMessages}
                className="text-[10px] text-emerald-300 hover:underline cursor-pointer"
              >
                {loadingMessages ? 'Syncing…' : 'Refresh'}
              </button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1.5">
              {chatMessages.length === 0 ? (
                <div className="text-[10px] text-slate-500 py-2 text-center">
                  No messages in this Space yet. Post a move proposal above!
                </div>
              ) : (
                chatMessages.map((m) => (
                  <div
                    key={m.name}
                    className="p-1.5 bg-black/50 border border-slate-800 rounded-sm text-[10px]"
                  >
                    <div className="flex justify-between text-emerald-400 mb-0.5">
                      <span>{m.sender?.displayName || 'Workspace Member'}</span>
                      <span className="text-slate-500">
                        {m.createTime
                          ? new Date(m.createTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-slate-200 whitespace-pre-line font-sans">{m.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Negotiated Active/Passive Proposals Feed with One-Click Load into SC1 Dock */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase text-emerald-300 tracking-wider">
            Negotiated Move Proposals ({proposals.length})
          </div>
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className="p-2.5 bg-[#08110D] border border-[#1E3A2F] rounded-sm space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className={`px-1.5 py-0.5 rounded-sm font-bold ${
                    prop.player === 'player1'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {prop.player === 'player1' ? 'P1 MOVE' : 'P2 MOVE'} · {prop.author}
                </span>
                <span className="text-slate-500">
                  {prop.source === 'google_chat' ? 'Google Chat' : 'Comms'} · {prop.timestamp}
                </span>
              </div>

              <div className="p-1.5 bg-black/60 border border-slate-800/90 rounded-sm space-y-1 text-[11px]">
                <div>
                  <span className="text-emerald-400 font-bold">Active:</span>{' '}
                  <span className="text-slate-100 font-sans">{prop.activeMove}</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-bold">Passive:</span>{' '}
                  <span className="text-slate-200 font-sans">{prop.passiveMove}</span>
                </div>
              </div>

              {prop.note && (
                <p className="text-[10px] text-slate-400 font-sans italic">“{prop.note}”</p>
              )}

              <button
                type="button"
                onClick={() =>
                  onApplyNegotiatedMove(prop.player, prop.activeMove, prop.passiveMove)
                }
                className="w-full flex items-center justify-center gap-1.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 rounded-sm text-[10px] font-bold uppercase transition-colors cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>
                  Load into {prop.player === 'player1' ? 'Player 1' : 'Player 2'} Command Slot
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Confirmation Modal before sending message to Google Chat API */}
      {pendingConfirmationPayload && (
        <div className="absolute inset-0 z-40 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full bg-[#0B1510] border-2 border-amber-400 rounded-sm p-3.5 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-300 font-bold uppercase text-xs">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Confirm Google Chat API Message Post</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              You are about to post this <strong>Active + Passive Move Proposal</strong> to Google
              Chat Space{' '}
              <code className="text-emerald-300">{pendingConfirmationPayload.spaceName}</code>:
            </p>
            <pre className="p-2 bg-black/80 border border-slate-800 rounded-sm text-[10px] text-emerald-200 whitespace-pre-wrap max-h-36 overflow-y-auto">
              {pendingConfirmationPayload.formattedText}
            </pre>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={sendingToGoogleChat}
                onClick={() => setPendingConfirmationPayload(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-sm text-[10px] uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingToGoogleChat}
                onClick={handleConfirmPostToGoogleChat}
                className="px-3 py-1 bg-[#22C55E] hover:bg-emerald-400 text-slate-950 font-bold rounded-sm text-[10px] uppercase cursor-pointer"
              >
                {sendingToGoogleChat ? 'Posting to Space…' : 'Confirm & Send to Google Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
