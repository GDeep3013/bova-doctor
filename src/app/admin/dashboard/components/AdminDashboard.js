
'use client'
import AppLayout from 'components/Applayout';
import DoctorTable from './doctorTable';
import { ReactionIcon, StethoscopeIcon } from 'components/svg-icons/icons';
import AdminGraph from './adminGraph';

export default function AdminDashboard() {

    const cards = [
        {
            title: '56 Doctors',
            subtitle: 'Total Doctors Using BOVA',
            icon: <StethoscopeIcon />,
        },
        {
            title: '38 Patients',
            subtitle: 'Total Number of Patients',
            icon: <ReactionIcon />,
        },
    ];

    return (
        <AppLayout>
            <div className="flex flex-col">
                <div className="w-full bg-black relative text-white rounded-lg flex flex-col md:flex-row items-center mt-9 py-12 px-16 mb-8">
                    <div className="flex-1 mb-4 md:mb-0">
                        <h1 className="text-2xl font-semibold mb-2">Welcome to your BOVA Admin Panel</h1>
                        <p className="text-sm mb-4"> We will be launching the full site access in less than 2 weeks! Stay tuned. </p>
                        <p className="italic mb-6">- Team BOVA</p>
                        <button className="bg-white text-black font-medium px-4 py-2 rounded min-w-[196px] min-h-[50px]"> Invite Doctors </button>
                    </div>
                    <div className="md:w-1/3 flex justify-center absolute right-9 bottom-0">
                        <img src="/images/admin-img.png" alt="Doctor" className='max-w-[90%]'/>
                    </div>
                </div>

                <div className='flex space-x-5'>
                    <DoctorTable className="w-full" />
                    <div className='w-full'>
                        <div className="flex space-x-5">
                            {cards.map((card, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-[#F9F9F9] rounded-lg p-6 w-full shadow-sm"
                                >
                                    <div>
                                        <h3 className="text-2xl font-semibold">{card.title}</h3>
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
                        <div className='mt-4'>
                            <AdminGraph />
                        </div>
                    </div>
                </div>
            </div>

        </AppLayout>
    )
}

