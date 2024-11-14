'use client'
import AppLayout from 'components/Applayout';
import DoctorTable from './doctorTable';
import { PlanIcon, ReactionIcon, WalletIcon } from 'components/svg-icons/icons';
import DoctorGraph from './doctarGraph';
import Link from 'next/link';

export default function AdminDashboard() {

    const cards = [
        {
            title: 'Total Earnings',
            subtitle: 'Total earnings',
            icon: <WalletIcon />,
        },
        {
            title: '38 Patients',
            subtitle: 'Total Number of Patients',
            icon: <ReactionIcon />,
        },
        {
            title: 'Total Plans',
            subtitle: 'Total Number of Plans',
            icon: <PlanIcon />,
        },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col">
                <div className="w-full bg-customBg relative text-white rounded-lg flex flex-col md:flex-row items-center py-8 md:py-12 px-8 md:px-16 mb-8 max-[767px]:mt-5">
                    <div className="flex-1 mb-4 md:mb-0">
                        <h1 className="text-xl md:text-2xl font-semibold mb-2 text-black">Welcome to your BOVA</h1>
                        <p className="text-sm mb-4 text-black"> We will be launching the full site access in less than 2 weeks! Stay tuned. </p>
                        <p className="italic mb-6 text-black">- Team BOVA</p>
                        <Link href='/patients/create' className="bg-customBg2 text-white border border-customBg2 font-medium px-4 py-2 rounded min-w-[196px] min-h-[50px] hover:text-customBg2 hover:bg-white"> Create Patient </Link>
                    </div>
                </div>

                <div className='doctor-graph'>

                <div className="min-[1025px]:mt-0 flex max-[575px]:gap-y-4 min-[576px]:space-x-5 max-[575px]:flex-wrap">
                            {cards.map((card, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-[#F9F9F9] rounded-lg p-6 w-full shadow-sm"
                                >
                                    <div>
                                        <h3 className="text-xl md:text-2xl font-semibold">{card.title}</h3>
                                        <p className="text-base mt-1 text-gray-500">{card.subtitle}</p>
                                    </div>
                                    <div className="flex-shrink-0 bg-[#EBEDEB] w-[41px] h-[41px] rounded-[5px] shadow-sm relative card-icon">
                                        <div className="text-3xl text-black absolute card-svg">
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                </div>

                <div className='flex min-[1281px]:space-x-5 max-xl:flex-wrap mt-6'>
                    <DoctorTable className="w-full" />
                    <div className='w-full'>
                        <div className=''>
                            <DoctorGraph />
                        </div>
                    </div>
                </div>
            </div>

        </AppLayout>
    )
}

