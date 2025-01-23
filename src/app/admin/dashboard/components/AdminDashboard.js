'use client'
import AppLayout from 'components/Applayout';
import DoctorTable from './doctorTable';
import { ReactionIcon, StethoscopeIcon ,InviteSend ,MedicinePill} from 'components/svg-icons/icons';
import AdminGraph from './adminGraph';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Loader from 'components/loader';
import { useSession } from 'next-auth/react';
export default function AdminDashboard() {
    const { data: session } = useSession();
    const [totalDoctors, setTotalDoctors] = useState('')
    const [totalPatient, setTotalPatient] = useState('')
    const [doctors, setDoctors] = useState([])
    const [currentMonthEarning, setCurrentMonthEarning] = useState([]);
    const [graphMonth, SetGraphMonths] = useState([]);
    const [graphValue, SetGraphValue] = useState([]);
    const [fetchLoader, setFetchLoader] = useState(false);
    const [doctorsSignedIn, SetDoctorsSignedIn] = useState('');
    const [inviteSent, SetInviteSent] = useState('');
    const [unitSolds, SetUnitSolds] = useState('');

    const fetchData = async () => {
        try {
            setFetchLoader(true)
            const response = await fetch(`/api/admin/dashboard`);
            if (!response.ok) {
                throw new Error("Failed to fetch doctors");
            }
            const data = await response.json();
            if (data) {
                const filteredDoctors = session?.userDetail
                ? data?.doctorsData.filter(doctor => doctor.id !== session.userDetail._id)
                    : doctors;
            
                SetDoctorsSignedIn(data?.doctorsSignedIn)
                SetUnitSolds(data?.unitSolds)
                SetInviteSent(data?.inviteSent)
                setCurrentMonthEarning(data.currentMonthEarnings)
                setTotalDoctors(data.totalPatient)
                setTotalPatient(data.totalDoctors - 1)
                setDoctors(filteredDoctors)
                SetGraphMonths(data.graphMonth)
                SetGraphValue(data.graphValue)
                setFetchLoader(false)
            } else {
                setFetchLoader(false)
            }

        } catch (error) {
            console.log(error)
            setFetchLoader(false)
        }
    };

    useEffect(() => { fetchData() }, [])

    const cards = [
        {
            title: doctorsSignedIn + ' Doctors',
            subtitle: 'Total Number of Doctors Signed In',
            icon: <StethoscopeIcon />,
        },
        {
            title: inviteSent + ' Doctors',
            subtitle: 'Have Yet to Sign in',
            icon: <InviteSend />,
        },
        {
            title: unitSolds + ' Units',
            subtitle: 'Total Number of Units Sold by Doctors',
            icon: <MedicinePill />,
        },
        {
            title: totalDoctors + ' Patients',
            subtitle: 'Total Number of Patients',
            icon: <ReactionIcon />,
        },
        
    ];

    return (
        <AppLayout>
            <div className="flex flex-col">
                {fetchLoader ? <Loader /> : <>
                    <div className="w-full bg-customBg relative text-white rounded-lg flex flex-col md:flex-row items-center py-8 md:py-12 px-8 md:px-16 mb-8 max-[767px]:mt-5">
                        <div className="flex-1 mb-4 md:mb-0 w-full">
                            <h1 className="text-xl md:text-2xl font-semibold mb-2 text-[#53595B] ">Welcome to your BOVA Admin Panel</h1>
                            <p className="text-sm mb-4 text-black"> We will be launching the full site access in less than 2 weeks! Stay tuned. </p>
                            <p className="italic mb-6 text-black">- Team BOVA</p>
                            <Link href='/admin/doctor/create' className="bg-customBg2 text-white border border-customBg2 font-medium px-4 py-2 rounded min-w-[196px] min-h-[50px] hover:text-customBg2 hover:bg-white"> Create Doctors </Link>
                        </div>
                    </div>

                    <div className='flex min-[1361px]:space-x-5 max-[1360px]:flex-wrap'>
                        <DoctorTable className="w-full" doctors={doctors} />
                        <div className='w-full max-[1360px]:mt-4'>
                            <div className="mt-5 min-[1025px]:mt-0 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:gap-x-6 sm:gap-y-3">
                                {cards.map((card, index) => (
                                    <div
                                        key={index}
                                        className="max-[575px]:w-full max-[767px]:w-[48%] w-[48%] flex justify-between items-center bg-[#F9F9F9] rounded-lg p-4 xl:p-5 shadow-sm"
                                    >
                                        <div>
                                            <h3 className="text-base md:text-xl xl:text-xl text-[#53595B] font-bold">{card.title}</h3>
                                            <p className="text-sm mt-1 text-gray-500">{card.subtitle}</p>
                                        </div>
                                        <div className="flex-shrink-0 bg-[#EBEDEB] w-[41px] h-[41px] rounded-[5px] shadow-sm relative card-icon">
                                            <div className="text-3xl text-[#53595B] absolute card-svg w-[45px] h-[45px]">
                                                {card.icon}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className='mt-4 w-full max-w-full'>
                                <AdminGraph currentMonthEarning={currentMonthEarning} graphMonth={graphMonth} graphValue={graphValue} />
                            </div>
                        </div>
                    </div>
                </>}
            </div>

        </AppLayout>
    )
}

