'use client'
import { useSession } from 'next-auth/react';

export default function doctorTable({doctors }) {
    const { data: session } = useSession();
    const filteredDoctors = session?.userDetail
    ? doctors.filter(doctor => doctor.id !== session.userDetail._id)
        : doctors;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 pb-0 w-full mx-auto">
    <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg text-[#53595B] font-semibold">Top Doctor Performance</h2>
        {/* <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="text-gray-500 min-w-[150px] p-2 text-sm focus:outline-none"
        >
            <option>Last 2 Weeks</option>
            <option>Last Month</option>
            <option>Last Year</option>
        </select> */}
    </div>
    <div className='overflow-hidden overflow-x-auto max-w-full w-full'>
    <table className="min-w-[max-content] w-full text-left custom-table">
        <thead>
            <tr className="border-b">
                <th className="py-2 p-2">S.No</th>
                <th className='p-2'>Doctors</th>
                <th className='p-2'>Total Patients</th>
                <th className='p-2'>Total Plans</th>
                <th className='p-2'>Earnings</th>
            </tr>
        </thead>
        <tbody>
            {filteredDoctors.map((doctor,index) => (
                <tr key={index} className="">
                    <td className="p-2  text-[#53595B]  font-semibold">{index + 1}</td>
                    <td className="p-2 flex items-center space-x-4">
                        <div>
                            <p className="font-semibold text-[#53595B] text-sm">Dr. {doctor.name}</p>
                        </div>
                    </td>
                    <td className="p-2 text-[#53595B] ">{doctor.patients}</td>
                    <td className="p-2 text-[#53595B] ">{doctor.plans}</td>
                    <td className="p-2 flex items-center space-x-2">
                        <span className="text-[#53595B] font-medium"> $ {doctor.revenue}</span>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
    </div>
</div>
  )
}
