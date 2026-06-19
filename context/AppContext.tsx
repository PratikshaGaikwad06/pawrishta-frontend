import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Dog } from "./AuthContext";
import { useAuth } from "./AuthContext";
import { apiFetch } from "@/utils/apiClient";

export type Mode = "playdate" | "breeding";

export type RequestStatus = "pending" | "accepted" | "rejected";

export interface MatchRequest {
  id: string;
  fromOwnerId: string;
  fromDogId: string;
  toOwnerId: string;
  toDogId: string;
  mode: Mode;
  status: RequestStatus;
  createdAt: string;
  fromDog?: Dog;
  fromOwnerName?: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  fromOwnerId: string;
  text: string;
  createdAt: string;
}

interface AppContextType {
  mode: Mode;
  setMode: (m: Mode) => void;
  nearbyDogs: Dog[];
  requests: MatchRequest[];
  chats: Record<string, ChatMessage[]>;
  sendRequest: (toDogId: string, toOwnerId: string) => void;
  respondToRequest: (requestId: string, accept: boolean) => void;
  sendMessage: (matchId: string, text: string) => void;
  getMatchedDogs: () => MatchRequest[];
  getPendingIncoming: () => MatchRequest[];
  refreshRequests: () => Promise<void>;
}

interface InterestResponseDTO {
  id: number;
  senderId: number;
  receiverId: number;
  dogId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

interface MessageResponseDTO {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  createdAt: string;
}

interface ChatListResponseDTO {
  id: number;
  chatName: string;
}

interface MessageCursorResponseDTO {
  messages: MessageResponseDTO[];
  nextCursor: number | null;
  hasMore: boolean;
}

const CHATS_STORAGE = "@pawrishta_chats";

const MOCK_DOGS: Dog[] = [
  {
    id: "d1",
    ownerId: "u1",
    name: "Luna",
    breed: "French Bulldog",
    age: 2,
    gender: "female",
    weight: 10,
    bio: "Playful and loves cuddles. Great with kids and other dogs. Looking for a playmate!",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Playful", "Affectionate", "Calm"],
    distance: 0.8,
  },
  {
    id: "d2",
    ownerId: "u2",
    name: "Rocky",
    breed: "Siberian Husky",
    age: 4,
    gender: "male",
    weight: 28,
    bio: "Energetic and loves outdoor adventures. Perfect for hiking and running partners.",
    photos: [],
    vaccinated: true,
    neutered: false,
    temperament: ["Energetic", "Adventurous", "Loyal"],
    distance: 1.4,
  },
  {
    id: "d3",
    ownerId: "u3",
    name: "Bella",
    breed: "Labrador Retriever",
    age: 1,
    gender: "female",
    weight: 22,
    bio: "Super friendly puppy looking for friends! Loves fetch and swimming.",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Friendly", "Curious", "Gentle"],
    distance: 2.1,
  },
  {
    id: "d4",
    ownerId: "u4",
    name: "Charlie",
    breed: "Golden Retriever",
    age: 5,
    gender: "male",
    weight: 34,
    bio: "The most chill dog you'll ever meet. Great for breeding with health clearances.",
    photos: [],
    vaccinated: true,
    neutered: false,
    temperament: ["Gentle", "Patient", "Obedient"],
    distance: 3.0,
  },
  {
    id: "d5",
    ownerId: "u5",
    name: "Daisy",
    breed: "Border Collie",
    age: 3,
    gender: "female",
    weight: 18,
    bio: "Super smart and agility champion. Looking for a playdate partner who can keep up!",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Intelligent", "Active", "Focused"],
    distance: 4.2,
  },
  {
    id: "d6",
    ownerId: "u6",
    name: "Zeus",
    breed: "German Shepherd",
    age: 2,
    gender: "male",
    weight: 35,
    bio: "Well-trained and protective. Certified therapy dog. Loves meeting new friends.",
    photos: [],
    vaccinated: true,
    neutered: true,
    temperament: ["Loyal", "Protective", "Calm"],
    distance: 5.0,
  },
];

function mapInterestToRequest(i: InterestResponseDTO, myUserId: string): MatchRequest {
  const isIncoming = String(i.receiverId) === myUserId;
  return {
    id: String(i.id),
    fromOwnerId: String(i.senderId),
    fromDogId: String(i.dogId),
    toOwnerId: String(i.receiverId),
    toDogId: String(i.dogId),
    mode: "playdate",
    status: i.status === "PENDING" ? "pending" : i.status === "ACCEPTED" ? "accepted" : "rejected",
    createdAt: new Date().toISOString(),
    fromOwnerName: isIncoming ? `User ${i.senderId}` : undefined,
  };
}

const AppContext = createContext<AppContextType>({
  mode: "playdate",
  setMode: () => {},
  nearbyDogs: [],
  requests: [],
  chats: {},
  sendRequest: () => {},
  respondToRequest: () => {},
  sendMessage: () => {},
  getMatchedDogs: () => [],
  getPendingIncoming: () => [],
  refreshRequests: async () => {},
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { owner } = useAuth();
  const [mode, setModeState] = useState<Mode>("playdate");
  const [nearbyDogs] = useState<Dog[]>(MOCK_DOGS);
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>({});
  const [chatIdMap, setChatIdMap] = useState<Record<string, number>>({});

  const loadInterests = useCallback(async (userId: string) => {
    try {
      const [received, sent] = await Promise.all([
        apiFetch<InterestResponseDTO[]>(`/api/v1/users/${userId}/interests/received`),
        apiFetch<InterestResponseDTO[]>(`/api/v1/users/${userId}/interests/sent`),
      ]);
      const all = [...(received ?? []), ...(sent ?? [])];
      setRequests(all.map((i) => mapInterestToRequest(i, userId)));
    } catch (err) {
      console.warn("[AppContext] Failed to load interests:", err);
    }
  }, []);

  const loadChats = useCallback(async (userId: string) => {
    try {
      const apiChats = await apiFetch<ChatListResponseDTO[]>(`/api/v1/users/${userId}/chats`);
      if (!apiChats?.length) return;

      const newChatIdMap: Record<string, number> = {};
      const newChats: Record<string, ChatMessage[]> = {};

      await Promise.all(
        apiChats.map(async (c) => {
          const matchId = String(c.id);
          newChatIdMap[matchId] = c.id;
          try {
            const res = await apiFetch<MessageCursorResponseDTO>(
              `/api/v1/chats/${c.id}/messages?limit=50`,
            );
            newChats[matchId] = (res.messages ?? []).map((m) => ({
              id: String(m.id),
              matchId,
              fromOwnerId: String(m.senderId),
              text: m.content,
              createdAt: m.createdAt,
            }));
          } catch (err) {
            console.warn(`[AppContext] Failed to load messages for chat ${c.id}:`, err);
            newChats[matchId] = [];
          }
        }),
      );

      setChatIdMap(newChatIdMap);
      setChats(newChats);
    } catch (err) {
      console.warn("[AppContext] Failed to load chats:", err);
    }
  }, []);

  useEffect(() => {
    if (!owner?.id) return;
    loadInterests(owner.id);
    loadChats(owner.id);
  }, [owner?.id, loadInterests, loadChats]);

  useEffect(() => {
    if (owner?.id) return;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CHATS_STORAGE);
        if (stored) setChats(JSON.parse(stored));
      } catch (err) {
        console.warn("[AppContext] Failed to restore chats from storage:", err);
      }
    })();
  }, [owner?.id]);

  const refreshRequests = useCallback(async () => {
    if (!owner?.id) return;
    await loadInterests(owner.id);
  }, [owner?.id, loadInterests]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
  }, []);

  const sendRequest = useCallback(
    async (toDogId: string, toOwnerId: string) => {
      if (!owner?.id) return;

      const optimistic: MatchRequest = {
        id: `tmp-${Date.now()}`,
        fromOwnerId: owner.id,
        fromDogId: "mydog",
        toOwnerId,
        toDogId,
        mode,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setRequests((prev) => [...prev, optimistic]);

      const dogIdNum = parseInt(toDogId, 10);
      if (isNaN(dogIdNum)) {
        console.warn("[AppContext] sendRequest: toDogId is not a valid numeric ID:", toDogId);
        setRequests((prev) => prev.filter((r) => r.id !== optimistic.id));
        return;
      }

      try {
        const res = await apiFetch<InterestResponseDTO>(
          `/api/v1/users/${owner.id}/interests`,
          {
            method: "POST",
            body: JSON.stringify({ dogId: dogIdNum }),
          },
        );
        const confirmed = mapInterestToRequest(res, owner.id);
        setRequests((prev) =>
          prev.map((r) => (r.id === optimistic.id ? confirmed : r)),
        );
      } catch (err) {
        console.warn("[AppContext] Failed to send interest:", err);
        setRequests((prev) => prev.filter((r) => r.id !== optimistic.id));
      }
    },
    [owner?.id, mode],
  );

  const respondToRequest = useCallback(
    async (requestId: string, accept: boolean) => {
      if (!owner?.id) return;

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: accept ? ("accepted" as RequestStatus) : ("rejected" as RequestStatus) }
            : r,
        ),
      );

      try {
        const action = accept ? "accept" : "reject";
        await apiFetch(
          `/api/v1/users/${owner.id}/interests/${requestId}/${action}`,
          { method: "PUT" },
        );
        if (accept) {
          await loadChats(owner.id);
        }
      } catch (err) {
        console.warn("[AppContext] Failed to respond to interest:", err);
        await loadInterests(owner.id);
      }
    },
    [owner?.id, loadInterests, loadChats],
  );

  const sendMessage = useCallback(
    async (matchId: string, text: string) => {
      if (!owner?.id) return;

      const msg: ChatMessage = {
        id: `tmp-${Date.now()}`,
        matchId,
        fromOwnerId: owner.id,
        text,
        createdAt: new Date().toISOString(),
      };

      setChats((prev) => ({
        ...prev,
        [matchId]: [...(prev[matchId] ?? []), msg],
      }));

      const chatId = chatIdMap[matchId];
      if (chatId) {
        try {
          const res = await apiFetch<MessageResponseDTO>(
            `/api/v1/chats/${chatId}/messages`,
            {
              method: "POST",
              body: JSON.stringify({
                senderId: parseInt(owner.id, 10),
                content: text,
              }),
            },
          );
          const confirmed: ChatMessage = {
            id: String(res.id),
            matchId,
            fromOwnerId: String(res.senderId),
            text: res.content,
            createdAt: res.createdAt,
          };
          setChats((prev) => ({
            ...prev,
            [matchId]: (prev[matchId] ?? []).map((m) =>
              m.id === msg.id ? confirmed : m,
            ),
          }));
        } catch (err) {
          console.warn("[AppContext] Failed to send message via API:", err);
        }
      } else {
        setChats((prev) => {
          const updated = { ...prev, [matchId]: [...(prev[matchId] ?? []), msg] };
          AsyncStorage.setItem(CHATS_STORAGE, JSON.stringify(updated));
          return updated;
        });
      }
    },
    [owner?.id, chatIdMap],
  );

  const getMatchedDogs = useCallback(() => {
    return requests.filter((r) => r.status === "accepted");
  }, [requests]);

  const getPendingIncoming = useCallback(() => {
    return requests.filter((r) => r.toOwnerId === owner?.id && r.status === "pending");
  }, [requests, owner?.id]);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        nearbyDogs,
        requests,
        chats,
        sendRequest,
        respondToRequest,
        sendMessage,
        getMatchedDogs,
        getPendingIncoming,
        refreshRequests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
