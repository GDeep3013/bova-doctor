'use client'
import AppLayout from 'components/Applayout';
import DoctorTable from './doctorTable';
import { PlanIcon, ReactionIcon, WalletIcon } from 'components/svg-icons/icons';
import DoctorGraph from './doctarGraph';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AddPatient from '../../patients/components/AddPatient'

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [totalEarning, setTotalEarning] = useState(0);
    const [totalPatients, setTotalPatients] = useState(0);
    const [totalPlans, setTotalPlans] = useState(0);
    

    const fetchData = async () => {
        try {
            const response = await fetch(`/api/doctors/dashboard/?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            if (data) {
                setTotalEarning(data.totalEarnings);
                setTotalPatients(data.totalPatients);
                setTotalPlans(data.totalPlans);          

            }
        } catch (error) {
                console.log(error);
            }
    };


    useEffect(() => { fetchData() }, [])

    const cards = [
        {
            title: `$ ` + totalEarning,
            subtitle: 'Total earnings',
            icon: <WalletIcon />,
        },
        {
            title: totalPatients + ' Patients',
            subtitle: 'Total Number of Patients',
            icon: <ReactionIcon />,
        },
        {
            title: totalPlans + ' Plans',
            subtitle: 'Total Number of Plans',
            icon: <PlanIcon />,
        },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col">
                {/* <div className="w-full bg-customBg relative text-white rounded-lg flex flex-col md:flex-row items-center py-8 md:py-12 px-8 md:px-16 mb-8 max-[767px]:mt-5">
                    <div className="flex-1 mb-4 md:mb-0 w-full">
                        <h1 className="text-xl md:text-2xl font-semibold mb-2 text-black">Welcome to your BOVA</h1>
                        <p className="text-sm mb-4 text-black"> We will be launching the full site access in less than 2 weeks! Stay tuned. </p>
                        <p className="italic mb-6 text-black">- Team BOVA</p>
                        <Link href='/patients/create' className="bg-customBg2 text-white border border-customBg2 font-medium px-4 py-2 rounded min-w-[196px] min-h-[50px] hover:text-customBg2 hover:bg-white"> Create Patient </Link>
                    </div>
                </div> */}

                <div className='doctor-graph'>

                    <div className="min-[1025px]:mt-0 flex max-[575px]:gap-y-4 min-[576px]:space-x-5 max-[575px]:flex-wrap">
                        {cards.map((card, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center bg-[#F9F9F9] rounded-lg p-3 lg:p-6 w-full shadow-sm"
                            >
                                <div>
                                    <h3 className="text-md lg:text-xl xl:text-2xl font-semibold">{card.title}</h3>
                                    <p className="text-xs lg:text-sm xl:text-base mt-1 text-gray-500">{card.subtitle}</p>
                                </div>
                                <div className="flex-shrink-0 bg-[#EBEDEB] w-[31px] h-[31px] md:w-[41px] md:h-[41px] rounded-[5px] shadow-sm relative card-icon mr-2 md:mr-0">
                                    <div className="text-3xl text-black absolute card-svg">
                                        {card.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='flex min-[1281px]:space-x-5 max-xl:flex-wrap mt-6'>
                    {/* <DoctorTable patientData={patientData} timePeriod={timePeriod} setTimePeriod={setTimePeriod} /> */}
                    <div className='w-full'>
                        <div className=''>
                            <DoctorGraph />
                        </div>
                    </div>
                </div>
                <AddPatient/>
            </div>

        </AppLayout>
    )
}

