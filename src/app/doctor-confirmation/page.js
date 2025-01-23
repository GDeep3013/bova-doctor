
import DoctorConfirmation from './components/DoctorConfirmation'
import { Suspense } from 'react';
export default function page() {
  return (

    <Suspense fallback={<div>Loading...</div>}>
      <DoctorConfirmation />
    </Suspense>

  )
}
