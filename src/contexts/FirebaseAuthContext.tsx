import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/integrations/firebase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, teamId?: string, role?: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (password: string) => Promise<{ error: any }>
  resendConfirmation: (email: string) => Promise<{ error: any }>
  enableMFA: () => Promise<{ error: any, data?: any }>
  verifyMFA: (factorId: string, challengeId: string, code: string) => Promise<{ error: any }>
  disableMFA: (factorId: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, teamId?: string, role?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        userId: user.uid,
        email: user.email,
        fullName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        role: role || 'Staff',
        teamId: teamId || null,
        status: 'active',
        mfaEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const resendConfirmation = async (email: string) => {
    // Firebase handles email confirmation automatically
    // This is a placeholder for compatibility
    return { error: null }
  }

  const updatePassword = async (password: string) => {
    try {
      if (auth.currentUser) {
        await firebaseUpdatePassword(auth.currentUser, password)
        return { error: null }
      }
      return { error: new Error('No user logged in') }
    } catch (error: any) {
      return { error }
    }
  }

  const enableMFA = async () => {
    // Firebase MFA implementation would go here
    // For now, return a placeholder
    return { error: new Error('MFA not implemented yet'), data: null }
  }

  const verifyMFA = async (factorId: string, challengeId: string, code: string) => {
    // Firebase MFA implementation would go here
    return { error: new Error('MFA not implemented yet') }
  }

  const disableMFA = async (factorId: string) => {
    // Firebase MFA implementation would go here
    return { error: new Error('MFA not implemented yet') }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      resendConfirmation,
      enableMFA,
      verifyMFA,
      disableMFA
    }}>
      {children}
    </AuthContext.Provider>
  )
}

