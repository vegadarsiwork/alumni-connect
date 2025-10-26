# Phase 4: Developer Quick Reference

## 🚀 Quick Start

```bash
# Ensure database is up to date
npx prisma db push

# Run development server
npm run dev

# Test with seed data
npx prisma db seed
```

---

## 📁 Files Modified/Created

| File | Type | Changes |
|------|------|---------|
| `app/actions.ts` | Modified | Added `requestConnection()` and `updateConnectionStatus()` |
| `components/MatchList.tsx` | Modified | Added request button with state management |
| `app/(dashboard)/alumni/page.tsx` | Modified | Added pending requests and active connections sections |
| `app/(dashboard)/student/page.tsx` | Modified | Added connections section with status display |
| `app/(dashboard)/connection/[id]/page.tsx` | **NEW** | Private workspace for accepted connections |

---

## 🔧 Server Actions Reference

### Request Connection
```typescript
import { requestConnection } from '@/app/actions'

// Usage
await requestConnection(askId, offerId, alumId)
```

### Update Connection Status
```typescript
import { updateConnectionStatus } from '@/app/actions'

// Usage (Alumni only)
await updateConnectionStatus(connectionId, 'ACCEPTED')
await updateConnectionStatus(connectionId, 'DENIED')
await updateConnectionStatus(connectionId, 'COMPLETED')
```

---

## 🗄️ Database Queries

### Fetch Student Connections
```typescript
const connections = await prisma.connection.findMany({
  where: { studentId: user.id },
  include: { offer: true, alum: true },
  orderBy: { createdAt: 'desc' }
})
```

### Fetch Alumni Pending Requests
```typescript
const pendingRequests = await prisma.connection.findMany({
  where: { alumId: user.id, status: 'PENDING' },
  include: { ask: true, student: true },
  orderBy: { createdAt: 'desc' }
})
```

### Fetch Alumni Active Connections
```typescript
const acceptedConnections = await prisma.connection.findMany({
  where: { alumId: user.id, status: 'ACCEPTED' },
  include: { ask: true, student: true },
  orderBy: { createdAt: 'desc' }
})
```

### Fetch Connection by ID
```typescript
const connection = await prisma.connection.findUnique({
  where: { id: connectionId },
  include: {
    ask: true,
    offer: true,
    student: true,
    alum: true
  }
})
```

---

## 🎨 Component Patterns

### Server Action Form (Inline)
```tsx
<form
  action={async () => {
    'use server'
    await updateConnectionStatus(connectionId, 'ACCEPTED')
  }}
>
  <Button type="submit">Accept</Button>
</form>
```

### Client-Side Server Action
```tsx
'use client'
import { requestConnection } from '@/app/actions'

async function handleRequest() {
  try {
    await requestConnection(askId, offerId, alumId)
    // Success handling
  } catch (error) {
    // Error handling
  }
}
```

### Status Badge
```tsx
<Badge
  variant={
    status === 'ACCEPTED' ? 'default' :
    status === 'DENIED' ? 'destructive' :
    status === 'COMPLETED' ? 'secondary' :
    'outline'
  }
>
  {status}
</Badge>
```

### Conditional Rendering by Status
```tsx
{connection.status === 'ACCEPTED' && (
  <Link href={`/connection/${connection.id}`}>
    <Button>Open Workspace →</Button>
  </Link>
)}

{connection.status === 'PENDING' && (
  <p>Waiting for response...</p>
)}

{connection.status === 'DENIED' && (
  <p className="text-destructive">Request denied</p>
)}
```

---

## 🔒 Security Patterns

### Page-Level Security
```typescript
export default async function SecurePage({ params }) {
  const session = await getServerSession()
  if (!session?.user?.email) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  
  if (!user) redirect('/login')
  
  // Role check
  if (user.role !== 'STUDENT') redirect('/')
  
  // Resource ownership check
  const resource = await prisma.connection.findUnique({
    where: { id: params.id }
  })
  
  if (resource.studentId !== user.id && resource.alumId !== user.id) {
    redirect('/')
  }
  
  // Proceed with authorized access
}
```

### Server Action Security
```typescript
export async function secureAction() {
  'use server'
  
  const session = await getServerSession()
  if (!session?.user?.email) {
    throw new Error('Unauthorized')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user || user.role !== 'EXPECTED_ROLE') {
    throw new Error('Insufficient permissions')
  }
  
  // Proceed with action
}
```

---

## 🎯 Common Patterns

### Grid Layout
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <Card key={item.id}>
      {/* Card content */}
    </Card>
  ))}
</div>
```

### Empty State
```tsx
{items.length === 0 ? (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-12">
      <p className="text-muted-foreground">
        No items found. Create one to get started!
      </p>
    </CardContent>
  </Card>
) : (
  // Grid of items
)}
```

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false)

<Button disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </>
  ) : (
    'Submit'
  )}
</Button>
```

---

## 🐛 Debugging Tips

### Check Session
```typescript
const session = await getServerSession()
console.log('Session:', session)
console.log('User email:', session?.user?.email)
```

### Check Database Query Results
```typescript
const connections = await prisma.connection.findMany({...})
console.log('Found connections:', connections.length)
console.log('First connection:', connections[0])
```

### Check Revalidation
```typescript
import { revalidatePath } from 'next/cache'

revalidatePath('/alumni')
console.log('Revalidated /alumni')
```

### Network Tab
- Open browser DevTools → Network
- Filter by "Fetch/XHR"
- Check server action responses
- Verify status codes (200 = success)

### Server Logs
- Check terminal running `npm run dev`
- Errors will appear with stack traces
- Console.log statements show here for server components

---

## 📊 Status Flow

```
PENDING ──[Accept]──> ACCEPTED ──[Complete]──> COMPLETED
   │
   └────[Deny]────> DENIED
```

---

## 🧪 Test Accounts (from seed)

```typescript
// Student 1
Email: alex.kumar@student.com
Password: test123

// Student 2
Email: priya.singh@student.com
Password: test123

// Alumni 1
Email: sarah.chen@alumni.com
Password: test123

// Alumni 2
Email: john.patel@alumni.com
Password: test123
```

---

## 🔄 Revalidation Paths

| Action | Revalidated Paths |
|--------|------------------|
| Request Connection | `/student/ask/[askId]`, `/alumni` |
| Update Status | `/alumni`, `/connection/[id]` |
| Create Ask | `/student` |
| Create Offer | `/alumni` |

---

## 🎨 Tailwind Classes Reference

### Status Colors
```tsx
PENDING:   bg-gray-100 text-gray-800
ACCEPTED:  bg-blue-100 text-blue-800
DENIED:    bg-red-100 text-red-800
COMPLETED: bg-green-100 text-green-800
```

### Layout
```tsx
Spacing:     space-y-4, space-y-8
Grid:        grid gap-4 md:grid-cols-2 lg:grid-cols-3
Flex:        flex items-center justify-between
Padding:     p-4, p-6, py-12
```

### Typography
```tsx
Heading:     text-3xl font-bold tracking-tight
Subheading:  text-2xl font-semibold
Muted:       text-muted-foreground
Small:       text-sm
```

---

## 🚨 Common Errors & Solutions

### Error: "User not found"
**Cause:** Session email doesn't match database  
**Fix:** Check user exists, re-login if needed

### Error: "Only students can request connections"
**Cause:** User has wrong role  
**Fix:** Verify user.role in database

### Error: "Connection not found"
**Cause:** Invalid connection ID  
**Fix:** Check URL parameter, verify ID exists

### Error: Page redirect loop
**Cause:** Conflicting redirect logic  
**Fix:** Review role checks and redirects

### TypeScript Error: Property does not exist
**Cause:** Missing type definition  
**Fix:** Check Prisma schema, regenerate client

---

## 📦 Dependencies Used

```json
{
  "@prisma/client": "Database ORM",
  "next-auth": "Authentication",
  "next": "Framework",
  "react": "UI library",
  "lucide-react": "Icons (Loader2)"
}
```

---

## 🎓 Learning Resources

- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [NextAuth.js](https://next-auth.js.org/getting-started/example)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## ✅ Pre-Deploy Checklist

- [ ] All TypeScript errors resolved
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Test accounts working
- [ ] All status flows tested
- [ ] Security checks passed
- [ ] UI responsive on mobile
- [ ] Error handling in place
- [ ] Loading states working
- [ ] Empty states helpful

---

**Phase 4 Implementation Complete! 🎉**

Need help? Check:
- `PHASE_4_SUMMARY.md` - Detailed implementation guide
- `TESTING_PHASE_4.md` - Comprehensive test scenarios
- `docs/PHASE_4_WORKFLOW.md` - Visual workflow diagrams
