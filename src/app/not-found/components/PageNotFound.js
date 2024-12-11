import React from 'react'
import Link from 'next/link';
export default function PageNotFound() {
    return (<>
        <div class="bg-gray-100 h-screen flex items-center justify-center">
            <div class="text-center">
                <div class="text-gray-600 text-8xl mb-6">

                    <span class="block"><img src="/images/emoji.svg" className='ms-24 w-52 h-52'/></span>
                </div>
                <h1 class="text-gray-700 text-4xl font-bold mb-4">404</h1>
                <p class="text-gray-600 text-lg mb-4">Page not found</p>
                <p class="text-gray-500 text-sm">
                    The page you are looking for doesn&apos;t exist or an error occurred.<br />
                    
                    <Link href="/" class="text-blue-500 underline">Go back</Link> 
                </p>
            </div>
        </div>
    </>
    )
}
