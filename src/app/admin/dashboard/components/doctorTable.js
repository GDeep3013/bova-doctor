'use client';
import { useState } from 'react';

const DoctorTable = () => {
    const [timePeriod, setTimePeriod] = useState("Last 2 Weeks");

    const doctors = [
        { id: 1, name: "Dr. Mathilda Bell", revenue: "$8,192.000", patients: 187, products: 52, rate: 100, img: "/images/doctor1.jpg" },
        { id: 2, name: "Dr. Marion Figueroa", revenue: "$6,100.000", patients: 235, products: 49, rate: 90, img: "/images/doctor2.jpg" },
        { id: 3, name: "Dr. Lee Barrett", revenue: "$4,220.000", patients: 365, products: 36, rate: 75, img: "/images/doctor3.jpg" },
        { id: 4, name: "Dr. Joseph Brooks", revenue: "$1,628.000", patients: 458, products: 28, rate: 60, img: "/images/doctor4.jpg" },
    ];

    return (
        <div className="bg-white rounded-lg shadow-md p-4 pb-0 w-full mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Top Doctor Performance</h2>
                <select
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(e.target.value)}
                    className="text-gray-500 text-sm focus:outline-none"
                >
                    <option>Last 2 Weeks</option>
                    <option>Last Month</option>
                    <option>Last Year</option>
                </select>
            </div>
            <table className="w-full text-left custom-table">
                <thead>
                    <tr className="border-b">
                        <th className="py-2">S.No</th>
                        <th>Doctors</th>
                        <th>Total Patients</th>
                        <th>Total Recommended Products</th>
                        <th>Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {doctors.map((doctor) => (
                        <tr key={doctor.id} className="">
                            <td className="p-3 text-gray-700 font-semibold">{doctor.id}</td>
                            <td className="p-3 flex items-center space-x-4">
                                <img src={doctor.img} alt={doctor.name} className="w-[40px] h-[40px] object-cover rounded-full" />
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{doctor.name}</p>
                                    <p className="text-gray-500 text-sm">{doctor.revenue}</p>
                                </div>
                            </td>
                            <td className="p-3 text-gray-700">{doctor.patients}</td>
                            <td className="p-3 text-gray-700">{doctor.products} Products Sold</td>
                            <td className="p-3 flex items-center space-x-2">
                                {/* <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                                    <span className="text-xs text-gray-500">{doctor.rate}%</span>
                                </div> */}
                                <span className="text-gray-700 font-medium">{doctor.rate}%</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DoctorTable;
