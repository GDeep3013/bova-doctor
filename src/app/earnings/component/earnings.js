'use client'
import AppLayout from 'components/Applayout';
import DoctorGraph from './doctarGraph';
import Sales from './Sales';

export default function Earnings() {


    return (
        <AppLayout>
            <h1 className="text-2xl pt-4 md:pt-1 mb-1">Earnings</h1>
            <div className='flex min-[1281px]:space-x-5 max-xl:flex-wrap mt-6 overflow-hidden'>

                {/* <DoctorTable patientData={patientData} timePeriod={timePeriod} setTimePeriod={setTimePeriod} /> */}
                <div className='w-full'>
                    <div className=''>
                        <DoctorGraph />
                    </div>
                </div>
            </div>
            <div className='mt-6'>
                <Sales />
            </div>
        </AppLayout>
    )
}
