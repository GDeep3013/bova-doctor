import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl; // Extract the requested route
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const res = NextResponse.next(); // Create a NextResponse object

  res.headers.append('Access-Control-Allow-Credentials', "true")
  res.headers.append('Access-Control-Allow-Origin', '*') // replace this your actual origin
  res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')// Allowed methods
  // Define accessible routes based on user roles
  const guestRoutes = ['/', '/login', '/forget-password', '/register', '/reset-password', '/create-password','/privacy-policies','/terms-services'];
  
  const adminRoutes = ['/admin/dashboard', '/admin/settings', '/admin/patients', '/admin/doctor/listing', '/admin/doctor', '/admin/doctor/create', '/admin/doctor/edit', ];
  const doctorRoutes = [
    '/dashboard',
    '/profile',
    '/patients/listing',
    '/patients/create',
    '/patients/edit',
    '/privacy-policies',
    '/patients/detail',
    '/sale',
    '/plans/create-plan',
    '/plans/review',
    '/plans/plan-detail/',
    '/plans/edit-plan/',
    '/earnings',

  ];


  if (!token) {
    if (!guestRoutes.includes(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // User is authenticated
  const userRole = token.userType;
  if (userRole !== 'Admin' && userRole !== 'Doctor') {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (userRole === 'Admin') {
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
    if (!isAdminRoute) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/dashboard';
      return NextResponse.redirect(url);
    }
  } else if (userRole === 'Doctor') {
    const isDoctorRoute = doctorRoutes.some(route => pathname.startsWith(route));
    if (!isDoctorRoute) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  if (guestRoutes.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = userRole === 'Admin' ? '/admin/dashboard' : '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    //admin
    '/admin/dashboard/:path*',
    '/admin/settings',
    '/admin/patients/:path*',
    '/admin/doctor/:path*',

    //doctor
    '/dashboard',
    '/profile',
    '/privacy-policies',
    '/patients/:path*',
    '/plans/:path*',
    '/earnings',

    '/',
    '/login',
    '/forget-password',
    '/register',
    '/reset-password',
    '/create-password',
    '/terms-services'


  ]

};
