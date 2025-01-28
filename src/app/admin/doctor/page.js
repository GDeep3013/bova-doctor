import DoctorListing from "./components/DoctorListing";
import { Suspense } from 'react';
export default function page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DoctorListing />  </Suspense>
    )
}
