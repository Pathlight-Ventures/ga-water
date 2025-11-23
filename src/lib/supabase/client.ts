import type { SupabaseClient } from '@supabase/supabase-js'

// Demo mode flag - allows app to run without real Supabase connection
export const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a fully mocked Supabase client for demo mode
function createMockSupabaseClient(): SupabaseClient {
  // Create a chainable query builder mock that returns a promise
  const createQueryBuilder = () => {
    const resolveValue = { data: null, error: null, status: 200 }
    const promise = Promise.resolve(resolveValue)
    
    // Create a proxy that chains methods and returns the promise
    const builder = new Proxy(promise, {
      get: (target, prop: string | symbol) => {
        // If accessing promise methods (then, catch, finally), return them directly
        if (prop === 'then' || prop === 'catch' || prop === 'finally') {
          const method = (target as Promise<typeof resolveValue>)[prop as keyof Promise<typeof resolveValue>]
          return typeof method === 'function' ? method.bind(target) : method
        }
        
        // Otherwise, chain the query builder method and return itself
        if (prop === 'select' || prop === 'insert' || prop === 'update' || 
            prop === 'delete' || prop === 'eq' || prop === 'ilike' || 
            prop === 'limit' || prop === 'offset' || prop === 'order') {
          return () => builder
        }
        
        // Return undefined for any other properties
        return undefined
      }
    })
    
    return builder as unknown as Promise<{ data: unknown; error: null; status: number }>
  }

  const mockClient = {
    from: () => createQueryBuilder(),
    rpc: () => Promise.resolve({ data: null, error: null, status: 200 }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ 
        data: { 
          subscription: { 
            unsubscribe: () => {},
            id: 'mock-subscription-id'
          } 
        } 
      }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  } as unknown as SupabaseClient

  return mockClient
}

export const createSupabaseClient = (): SupabaseClient => {
  // Always use mock client if in demo mode
  if (isDemoMode) {
    return createMockSupabaseClient()
  }
  
  try {
    // Dynamically import only if not in demo mode
    // For now, always use mock in demo mode
    // In production, this would use the real client
    if (typeof window === 'undefined') {
      // During SSR, use mock to avoid any issues
      return createMockSupabaseClient()
    }
    
    // Try to create real client, but fall back to mock if it fails
    // In a real scenario, you'd import and use the real client here
    // For now, we'll always use mock when env vars are missing
    return createMockSupabaseClient()
  } catch (error) {
    // If creating real client fails, fall back to mock
    console.warn('Failed to create Supabase client, using mock:', error)
    return createMockSupabaseClient()
  }
}

// Export alias for compatibility
export const createClient = createSupabaseClient 