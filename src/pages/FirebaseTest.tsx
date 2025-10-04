import React, { useState } from 'react'
import { useAuth } from '@/contexts/FirebaseAuthContext'
import { collection, addDoc, getDocs } from 'firebase/firestore'
import { db } from '@/integrations/firebase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function FirebaseTest() {
  const { user, signIn, signUp } = useAuth()
  const [email, setEmail] = useState('test@example.com')
  const [password, setPassword] = useState('password123')
  const [testResult, setTestResult] = useState('')

  const testSignIn = async () => {
    try {
      const result = await signIn(email, password)
      setTestResult(result.error ? `Sign in error: ${result.error.message}` : 'Sign in successful!')
    } catch (error: any) {
      setTestResult(`Sign in error: ${error.message}`)
    }
  }

  const testSignUp = async () => {
    try {
      const result = await signUp(email, password)
      setTestResult(result.error ? `Sign up error: ${result.error.message}` : 'Sign up successful!')
    } catch (error: any) {
      setTestResult(`Sign up error: ${error.message}`)
    }
  }

  const testFirestore = async () => {
    if (!user) {
      setTestResult('Please sign in first')
      return
    }

    try {
      // Test creating a document
      const testDoc = {
        title: 'Test Task',
        description: 'This is a test task',
        userId: user.uid,
        status: 'todo',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const docRef = await addDoc(collection(db, 'tasks'), testDoc)
      setTestResult(`Firestore test successful! Document ID: ${docRef.id}`)
    } catch (error: any) {
      setTestResult(`Firestore error: ${error.message}`)
    }
  }

  const testReadFirestore = async () => {
    if (!user) {
      setTestResult('Please sign in first')
      return
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'))
      const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTestResult(`Firestore read successful! Found ${tasks.length} tasks`)
    } catch (error: any) {
      setTestResult(`Firestore read error: ${error.message}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Firebase Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>User Status:</strong> {user ? `Signed in as ${user.email}` : 'Not signed in'}</p>
          </div>
          
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="space-x-2">
            <Button onClick={testSignUp}>Test Sign Up</Button>
            <Button onClick={testSignIn}>Test Sign In</Button>
            <Button onClick={testFirestore} disabled={!user}>Test Firestore Write</Button>
            <Button onClick={testReadFirestore} disabled={!user}>Test Firestore Read</Button>
          </div>

          {testResult && (
            <div className="p-4 bg-gray-100 rounded">
              <strong>Test Result:</strong> {testResult}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}