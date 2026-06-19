import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch } from "@/utils/apiClient";

export interface Owner {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  location: string;
  bio: string;
  verified: boolean;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  bio: string;
  photos: string[];
  vaccinated: boolean;
  neutered: boolean;
  temperament: string[];
  distance?: number;
}

interface AuthContextType {
  owner: Owner | null;
  myDog: Dog | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (owner: Partial<Owner>, dog: Partial<Dog>) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  location: string;
  dogName: string;
  dogBreed: string;
  dogAge: number;
  dogGender: "male" | "female";
}

interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

interface DogResponseDTO {
  id: number;
  name: string;
  breed: string;
  age: number;
  gender: string;
  temperament?: string;
  mode?: string;
  photo_url?: string;
  ownerId: number;
}

interface ApiResponseDogResponseDTO {
  message: string;
  data: DogResponseDTO;
  status: number;
}

function mapApiDog(d: DogResponseDTO): Dog {
  return {
    id: String(d.id),
    ownerId: String(d.ownerId),
    name: d.name,
    breed: d.breed,
    age: d.age,
    gender: (d.gender?.toLowerCase() === "female" ? "female" : "male") as "male" | "female",
    weight: 0,
    bio: "",
    photos: d.photo_url ? [d.photo_url] : [],
    vaccinated: false,
    neutered: false,
    temperament: d.temperament ? d.temperament.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };
}

const AuthContext = createContext<AuthContextType>({
  owner: null,
  myDog: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: () => {},
});

const STORAGE_KEY = "@pawrishta_auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [myDog, setMyDog] = useState<Dog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { owner: o, myDog: d } = JSON.parse(stored);
          setOwner(o);
          setMyDog(d);
        }
      } catch (err) {
        console.warn("[AuthContext] Failed to restore session from storage:", err);
      }
      setIsLoading(false);
    })();
  }, []);

  const persist = useCallback(async (o: Owner, d: Dog) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ owner: o, myDog: d }));
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { owner: o, myDog: d } = JSON.parse(stored);
      if (o && o.email.toLowerCase() === email.toLowerCase()) {
        try {
          const fresh = await apiFetch<UserResponseDTO>(`/api/v1/users/${o.id}`);
          const refreshedOwner: Owner = {
            ...o,
            id: String(fresh.id),
            name: fresh.name,
            email: fresh.email,
          };
          setOwner(refreshedOwner);
          setMyDog(d);
          await persist(refreshedOwner, d);
          return;
        } catch (err) {
          console.warn("[AuthContext] Could not refresh user from API, using cached data:", err);
          setOwner(o);
          setMyDog(d);
          return;
        }
      }
    }
    throw new Error("No account found for this email on this device. Please register first.");
  }, [persist]);

  const register = useCallback(async (data: RegisterData) => {
    const userRes = await apiFetch<UserResponseDTO>("/api/v1/users/register", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        latitude: 0,
        longitude: 0,
      }),
    });

    const newOwner: Owner = {
      id: String(userRes.id),
      name: userRes.name,
      email: userRes.email,
      location: data.location,
      bio: "",
      verified: false,
    };

    const dogRes = await apiFetch<ApiResponseDogResponseDTO>(
      `/api/v1/users/${userRes.id}/dogs`,
      {
        method: "POST",
        body: JSON.stringify({
          name: data.dogName,
          breed: data.dogBreed,
          age: data.dogAge,
          gender: data.dogGender,
        }),
      },
    );

    const newDog = mapApiDog(dogRes.data);

    setOwner(newOwner);
    setMyDog(newDog);
    await persist(newOwner, newDog);
  }, [persist]);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setOwner(null);
    setMyDog(null);
  }, []);

  const updateProfile = useCallback((ownerData: Partial<Owner>, dogData: Partial<Dog>) => {
    setOwner((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...ownerData };
      setMyDog((prevDog) => {
        if (!prevDog) return prevDog;
        const updatedDog = { ...prevDog, ...dogData };
        persist(updated, updatedDog);
        return updatedDog;
      });
      return updated;
    });
  }, [persist]);

  return (
    <AuthContext.Provider
      value={{
        owner,
        myDog,
        isLoading,
        isAuthenticated: !!owner,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
