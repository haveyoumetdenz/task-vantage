import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase client with proper structure
const mockCollection = vi.fn(() => ({
  add: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
  doc: vi.fn(() => ({
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  })),
  where: vi.fn(() => mockCollection()),
  orderBy: vi.fn(() => mockCollection()),
  onSnapshot: vi.fn((callback) => {
    if (typeof callback === 'function') {
      callback({ docs: [] })
    }
    return () => {}
  }),
}))

const mockDb = {
  collection: mockCollection,
}

vi.mock('@/integrations/firebase/client', () => ({
  db: mockDb,
  auth: {
    currentUser: { uid: 'test-user-id' },
  },
  storage: {},
}))

// Mock Firebase Auth Context
vi.mock('@/contexts/FirebaseAuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    },
    loading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/test' }),
    useParams: () => ({}),
  }
})

// Mock Firebase hooks
vi.mock('@/hooks/useFirebaseProfile', () => ({
  useFirebaseProfile: () => ({
    profile: {
      userId: 'test-user-id',
      email: 'test@example.com',
      fullName: 'Test User',
      role: 'Staff',
      teamId: 'test-team-id',
    },
    loading: false,
    updateProfile: vi.fn(),
  }),
}))

vi.mock('@/hooks/useFirebaseRBAC', () => ({
  useFirebaseRBAC: () => ({
    isManager: false,
    isDirector: false,
    isSeniorManagement: false,
    isHR: false,
    userRole: 'Staff',
  }),
}))

// Mock Firebase Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: mockCollection,
  addDoc: vi.fn().mockResolvedValue({ id: 'mock-doc-id' }),
  updateDoc: vi.fn().mockResolvedValue({}),
  deleteDoc: vi.fn().mockResolvedValue({}),
  doc: vi.fn(() => ({ id: 'mock-doc-id' })),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((query, callback) => {
    if (typeof callback === 'function') {
      callback({ docs: [] })
    }
    return () => {}
  }),
  getDocs: vi.fn().mockResolvedValue({ docs: [] }),
}))

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}
