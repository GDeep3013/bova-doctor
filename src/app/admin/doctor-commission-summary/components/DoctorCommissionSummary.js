'use client';

import { useEffect, useState } from 'react';
import AppLayout from 'components/Applayout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from 'components/loader';
import { NextArrowIcon } from 'components/svg-icons/icons';

export default function DoctorCommissionSummary() {
  const [data, setData] = useState([]);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [expandedDoctor, setExpandedDoctor] = useState(null);
  const searchParams = useSearchParams();
  const currentPage = searchParams.get('page');
  const pageNumber = Number(currentPage);
  const [page, setPage] = useState(pageNumber ? pageNumber : 1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(30);
  const itemsPerPage = 30;
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (value) => Number(value || 0).toFixed(2);

  // useEffect(() => {
  //   fetch(`/api/doctors/doctor-sales-summary?page=${page}&limit=${limit}`) // Replace with your actual API route
  //     .then(res => res.json())
  //     .then(data => {
  //       setData(data);
  //       setTotalPages(data.pagination.totalPages);
  //       setLoading(false);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data:', error);
  //       setLoading(false);
  //     });
  // }, []);
  useEffect(() => { fetchDoctors(page, searchQuery, limit) }, [page, searchQuery, limit])
  const fetchDoctors = async (page, searchQuery = "", limit) => {
    const queryParams = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(searchQuery && { search: searchQuery }),
    }).toString();
    try {
      setLoading2(true)
      const response = await fetch(`/api/doctors/doctor-sales-summary?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }
      const data = await response.json();
      console.log('data', data)
      setData(data?.data);
      setTotalPages(data.pagination.totalPages);
      setLoading(false);
      setLoading2(false);

    } catch (error) {
      setLoading(false);
      setLoading2(false);
    }
  };
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setPage(1)
    fetchDoctors(1, value, limit);
  };

  const handlePagination = (page) => {
    setPage(page);
    router.push(`/admin/doctor-commission-summary?page=${page}&search=${searchQuery}&limit=${limit}`);
    fetchDoctors(page, searchQuery, limit);
  }
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  return (
    <AppLayout>
      <div className="mx-auto relative sm:static">
        
        {loading ? <Loader /> : <>    <div className='flex justify-end'>
      
        </div>
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-end md:mt-[16px] mb-4">
            <div>
              <h1 className="page-title md:pt-2 text-[19px] md:text-2xl">Doctor&apos;s Sales Summary</h1>
              <button className="text-gray-600 text-sm mb-4 text-left" onClick={() => { router.back() }}>&lt; Back</button>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <label class="text-gray-600 uppercase text-sm tracking-wider">Search</label>
                <input
                  type="text"
                  placeholder=""
                  value={searchQuery}
                  onChange={handleSearchChange}
                  class="border border-gray-300 rounded-[7px] px-4 py-1 outline-none focus:ring-none focus:ring-blue-400"
                />
              </div>
            </div>
          </div>


          <div className="overflow-x-auto mt-[29px]">
            <table className="doctor-summary-table min-w-[max-content] w-full text-left border border-[#aeaaac] rounded-[20px] border-separate" cellPadding={0} cellSpacing={0}>
              <thead className="bg-customBg">
                <tr className="border-b">

                  <th className="py-3 px-4 text-left text-[#53595B] font-normal rounded-tl-[20px] border-b border-[#aeaaac]">Doctor</th>
                  <th className="py-3 px-4 font-normal border-b border-[#aeaaac]">Date Joined</th>
                  <th className="py-3 px-4 font-normal border-b border-[#aeaaac]">Total Patients</th>
                  <th className="py-3 px-4 font-normal border-b border-[#aeaaac] ">Total Units Sold</th>
                  <th className="py-3 px-4 font-normal border-b border-[#aeaaac]">Total Earned</th>
                  <th className='py-3 px-4 font-normal border-b border-[#aeaaac] rounded-tr-[20px]'></th>
                </tr>
              </thead>
              <tbody>
              {loading2 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 h-[300px]">
                    <Loader />
                  </td>
                </tr>
              ) : data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    No doctors found.
                  </td>
                </tr>
                        ) : (
                  data.map((doctor, index) => (
                    <>
                      <tr
                        key={index}
                        className="cursor-pointer hover:bg-gray-100 border-b"
                        onClick={() => setExpandedDoctor(expandedDoctor === index ? null : index)}
                      >

                        <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">
                          <Link href={`/admin/doctor-commission-summary/${doctor.id}`} className="text-gray-700 hover:underline">
                            {doctor.doctor_name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">{formatDate(doctor.joined_date)}</td>
                        <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">{doctor.total_patients}</td>
                        <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">{doctor?.total_quantity_sold}</td>
                        <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">${doctor?.revenue}</td>
                        <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">
                          <Link href={`/admin/doctor-commission-summary/${doctor.id}`} className="text-gray-700 hover:underline inline-block align-middle w-[25px] h-[25px] hover:translate-x-1 transition-all">
                            <NextArrowIcon />
                          </Link>
                        </td>
                        {/* <td className="px-4 py-2 text-gray-700">${formatCurrency(doctor.total_commission)}</td> */}
                      </tr>
                      {/* {expandedDoctor === index && (
                  <tr>
                    <td colSpan="6" className="bg-gray-50 px-6 py-4">
                      <div className="mb-6">
                        <h3 className="font-semibold text-md mb-3">Monthly Summary</h3>
                        <table className="w-full border border-gray-200 mb-4">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 border">Month</th>
                              <th className="p-2 border">Total Sold ($)</th>
                              <th className="p-2 border">Total Commission ($)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(doctor.monthly_summary || {}).map(([month, summary], i) => (
                              <tr key={i}>
                                <td className="p-2 border">{month}</td>
                                <td className="p-2 border">${formatCurrency(summary.total_sold)}</td>
                                <td className="p-2 border">${formatCurrency(summary.total_commission)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h3 className="font-semibold text-md mb-3">Patient Details</h3>
                        <table className="w-full border border-gray-200">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="p-2 border">Patient Name</th>
                              <th className="p-2 border">Date</th>
                              <th className="p-2 border">Amount Paid ($)</th>
                              <th className="p-2 border">Commission Rate (%)</th>
                              <th className="p-2 border">Commission Earned ($)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {doctor.patients.map((patient, i) => (
                              patient.payments.map((payment, j) => (
                                <tr key={`${i}-${j}`}>
                                  <td className="p-2 border">{patient.patient_name}</td>
                                  <td className="p-2 border">{new Date(payment.date).toLocaleDateString()}</td>
                                  <td className="p-2 border">${formatCurrency(payment.amount_paid)}</td>
                                  <td className="p-2 border">{payment.commission_rate}%</td>
                                  <td className="p-2 border">${formatCurrency(payment.commission_earned)}</td>
                                </tr>
                              ))
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )} */}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end items-center space-x-4 mt-6">
            <button
              disabled={page === 1}
              onClick={() => handlePagination(page - 1)}
              className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'
                }`}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => handlePagination(page + 1)}
              className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'
                }`}
            >
              Next
            </button>
          </div></>}
      </div>
    </AppLayout>
  );
}
