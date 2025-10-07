# 🔥 Update Firestore Rules

## ✅ **Simplified Rules Applied**

I've simplified the Firestore rules to fix the syntax issues. The new rules are much cleaner:

### **📋 Read Rules (Tasks)**
```javascript
allow read: if request.auth != null && (
  // Staff/HR: Only their own assigned tasks
  (get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role in ['Staff', 'HR'] && 
   resource.data.assigneeIds != null && 
   request.auth.uid in resource.data.assigneeIds) ||
  // Manager: Can see all tasks (simplified for now)
  get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'Manager' ||
  // Director: Can see all tasks (simplified for now)
  get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'Director' ||
  // Senior Management: All tasks
  get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'Senior Management'
);
```

### **📋 Write Rules (Tasks)**
```javascript
allow write: if request.auth != null && (
  // Staff/HR: Only their own assigned tasks
  (get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role in ['Staff', 'HR'] && 
   resource.data.assigneeIds != null && 
   request.auth.uid in resource.data.assigneeIds) ||
  // Manager: Can write all tasks (simplified for now)
  get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'Manager' ||
  // Director: Can write all tasks (simplified for now)
  get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'Director' ||
  // Senior Management: All tasks
  get(/databases/$(database)/documents/profiles/$(request.auth.uid)).data.role == 'Senior Management'
);
```

## 🚀 **How to Deploy**

### **Option 1: Firebase Console (Recommended)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the entire content from `firestore.rules` file
5. Paste it into the rules editor
6. Click **"Publish"**

### **Option 2: Firebase CLI (if installed)**
```bash
firebase deploy --only firestore:rules
```

## 🧪 **Testing After Update**

After updating the rules:
1. **Refresh the browser** to clear any cached rules
2. **Check the console** for the debug messages
3. **Look for team tasks** in the "Team Tasks" tab
4. **Verify** that Directors can now see tasks from Engineering 2

## 🔍 **Debug Console Messages**

You should now see:
- `🔍 All tasks in database:` - Shows total tasks
- `Team member IDs:` - Shows team member user IDs
- `Team tasks query result:` - Shows query results
- `Filtered team tasks:` - Shows final team tasks

If you still don't see team tasks, the issue might be:
1. **No tasks exist** - Test 1 needs to create some tasks
2. **Wrong user ID** - Team member IDs don't match task creators
3. **Data structure** - Tasks might have different field names

Let me know what you see in the console! 🎯

