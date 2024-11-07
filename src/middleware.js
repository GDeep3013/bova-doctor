import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Define accessible routes based on user roles
  const guestRoutes = ['/', '/login', '/forget-password', '/register', '/reset-password', '/create-password'];
  const adminRoutes = ['/admin/doctor/listing', '/admin/doctor', '/admin/doctor/create', '/admin/doctor/edit'];
  const doctorRoutes = ['/dashboard', '/patients/create', '/patients/edit', '/patients/listing', '/patients/detail', '/sale', '/create-plan', '/profile'];

  // Redirect if no session (user not logged in) and accessing a protected route
  if (!token) {
    // If the user is trying to access a non-guest route without being logged in, redirect to login
    if (!guestRoutes.includes(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // User is authenticated, handle role-based route access
    const userRole = token.userType;

    // Check if the user has the correct role to access the route
    if (userRole === 'Admin' && !adminRoutes.some(route => pathname.startsWith(route))) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/doctor';
      return NextResponse.redirect(url);
    }
    
    if (userRole === 'Doctor' && !doctorRoutes.some(route => pathname.startsWith(route))) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // If logged-in user tries to access guest route, redirect based on role
    if (guestRoutes.includes(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = userRole === 'Admin' ? '/admin/doctor/listing' : '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Allow access if no redirects are triggered
  return NextResponse.next();
}

// Configuring which paths the middleware should apply to
export const config = {
  matcher: ['/admin/:path*', '/dashboard', '/login', '/forget-password', '/register', '/reset-password', '/create-password'],
};
