'use client'
import AppLayout from 'components/Applayout';
import { PlanIcon, ReactionIcon, WalletIcon } from 'components/svg-icons/icons';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AddPatient from '../../patients/components/AddPatient'
import Loader from 'components/loader';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [totalEarning, setTotalEarning] = useState(0);
    const [totalPatients, setTotalPatients] = useState(0);
    const [totalPlans, setTotalPlans] = useState(0);
    const [fetchLoader, setFetchLoader] = useState(false);


    const fetchData = async () => {
        try {
            setFetchLoader(true)
            const response = await fetch(`/api/doctors/dashboard/?userId=${session?.user?.id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            if (data) {
                setTotalEarning(data.totalEarnings);
                setTotalPatients(data.totalPatients);
                setTotalPlans(data.totalPlans);
                setFetchLoader(false)

            }
        } catch (error) {
            console.log(error);
            setFetchLoader(false)
        }
    };


    useEffect(() => { fetchData() }, [])

    const cards = [
        {
            title: `$ ` + totalEarning?.toFixed(2),
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
                {fetchLoader ? <Loader /> :
                    <>
                        <div className='doctor-graph max-w-5xl'>
                            <div className="min-[1025px]:mt-0 flex max-[575px]:gap-y-4 min-[576px]:space-x-5 max-[575px]:flex-wrap">
                                {cards.map((card, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center bg-[#F9F9F9] rounded-lg p-3 w-full shadow-sm"
                                    >
                                        <div>
                                            <h3 className="text-md lg:text-xl  font-bold text-[#53595B]">{card.title}</h3>
                                            <p className="text-xs lg:text-sm text-gray-500">{card.subtitle}</p>
                                        </div>
                                        <div className="flex-shrink-0 bg-[#EBEDEB] w-[31px] h-[31px] rounded-[5px] shadow-sm relative card-icon mr-2 md:mr-0">
                                            <div className="text-3xl text-[#53595B] absolute card-svg">
                                                {card.icon}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='create-plan-btns mt-[28px] mb-[5px]'>
                           
                            <Link href='/plans/create-plan' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit">
                                Create Plan
                            </Link>
                            <Link href='/patients/create' className="py-2 px-4 bg-[#4e768a] border border-[#4e768a] text-white rounded-[8px] hover:text-customBg2 hover:border-customBg2 hover:bg-inherit ml-4">
                                Add Patient
                            </Link>
                            {/* <Link href='/sales' className="py-2 px-4 bg-customBg2 border border-customBg2 text-white rounded-[8px] hover:text-customBg2 hover:bg-inherit ml-4">
                                Sales
                            </Link> */}
                            
                           
                        </div>

                        {/* <div className='welcome-collpase'>
                            <div className='welcome-collpase-box'>
                               <span className="bg-[#3c637a] py-[4px] px-[15px]">+</span>
                           </div>
                        </div> */}

                        <AddPatient />
                    </>}
            </div>
        </AppLayout>
    )
}

