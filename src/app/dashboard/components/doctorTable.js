'use client';
import { useState } from 'react';

const DoctorTable = (patientData) => {
    const [timePeriod, setTimePeriod] = useState("Last 2 Weeks");
    return (
        <div className="bg-white rounded-lg shadow-md p-4 pb-0 w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-base md:text-lg font-semibold">Patients</h2>
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
            <div className='overflow-hidden overflow-x-auto'>
            <table className="min-w-[max-content] w-full text-left custom-table">
                <thead>
                    <tr className="border-b">
                        <th className="py-2 p-2">S.No</th>
                        <th className='p-2'>Patients</th>
                        <th className='p-2'>Total Plans</th>
                        <th className='p-2'>Earnings</th>
                    </tr>
                </thead>
                <tbody>
                    {patientData.patientData.length> 0 && patientData.patientData.map((patient,index) => (
                        <tr key={index} className="">
                            <td className="p-2 text-gray-700 font-semibold">{index + 1}</td>
                            <td className="p-2 flex items-center space-x-4">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{patient.patient.firstName
                                    } {patient.patient.lastName
                                    }</p>
                                </div>
                            </td>
                            <td className="p-2 text-gray-700">{patient.planCount} </td>
                            <td className="p-2 flex items-center space-x-2">
                                <span className="text-gray-700 font-medium"> $ {patient.earnings}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default DoctorTable;