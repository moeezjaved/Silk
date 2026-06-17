import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refreshes the Supabase session on every request and orchestrates the
 * gated flow: unauthenticated users hitting a protected route go to /login;
 * authenticated-but-not-onboarded users hitting /editor go to /onboarding.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isEditor = path.startsWith('/editor')
  const isOnboarding = path.startsWith('/onboarding')
  const onboarded = Boolean(user?.user_metadata?.onboarded)

  // protect editor + onboarding
  if (!user && (isEditor || isOnboarding)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // logged in but hasn't completed onboarding → send to onboarding
  if (user && isEditor && !onboarded) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    url.searchParams.set('next', path + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // already onboarded → skip the onboarding screens
  if (user && isOnboarding && onboarded) {
    const url = request.nextUrl.clone()
    url.pathname = request.nextUrl.searchParams.get('next') || '/editor'
    return NextResponse.redirect(url)
  }

  return response
}
