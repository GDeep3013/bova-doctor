'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppLayout from 'components/Applayout';
import Loader from 'components/loader';
import { NextArrowIcon } from 'components/svg-icons/icons';
import { useSession } from 'next-auth/react';
export default function DoctorSales() {
  const { data: session } = useSession();
  
    const router = useRouter();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loading2, setLoading2] = useState(false);
    const [openAccordionIndex, setOpenAccordionIndex] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const searchParams = useSearchParams();
    const currentPage = searchParams.get('page');
    const pageNumber = Number(currentPage);
    const [limit] = useState(10);
    const [page, setPage] = useState(pageNumber ? pageNumber : 1);
    const [totalPages, setTotalPages] = useState(1);
    const fetchDoctorSales = async (doctorId, page, searchQuery = "", limit) => {
        if (!doctorId) return;
        setLoading2(true)
        fetch(`/api/doctors/doctor-sales-summary/${doctorId}?search=${searchQuery}&page=${page}&limit=${limit}`)
            .then((res) => {
                if (!res.ok) throw new Error('Doctor not found');
                return res.json();
            })
            .then((data) => {
                setDoctor(data);
                setTotalPages(data.pagination.totalPages);
                setLoading(false);
                setLoading2(false);
            })
            .catch((error) => {
                console.error('Error fetching doctor data:', error);
                setLoading(false);
                setLoading2(false);
                setDoctor(null);
            });
    }
    useEffect(() => {
        fetchDoctorSales(session?.user?.id, page, searchQuery, limit)
    }, [session?.user?.id, searchQuery, limit]);

    const toggleAccordion = (index) => {
        setOpenAccordionIndex(openAccordionIndex === index ? null : index);
    };
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setPage(1)
        fetchDoctorSales(session?.user?.id, 1, value, limit);
    };

    const handlePagination = (doctorId, page, searchQuery = "", limit) => {
        setPage(page);
        router.push(`/sales?page=${page}`);
        fetchDoctorSales(doctorId, page, searchQuery, limit)
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
                {loading ? (
                    <Loader />
                ) : !doctor ? (
                    <p className="p-4 text-red-500">Doctor not found</p>
                ) : (
                    <>
                        <div className="flex justify-end">
                            <button onClick={()=>{router.push(`/plans/review`)}} className="absolute md:static bg-[#2c444b] text-white text-base px-2 sm:px-6 text-sm sm:text-md py-2 rounded-lg hover:bg-[#0b1214]">
                                Review Plan
                            </button>
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap justify-between items-end md:mt-[16px] mb-4">
                            <div>
                                <h2 className="page-title md:pt-2 text-[19px] sm:text-2xl">Sales</h2>
                                {/* <h1 className="page-title md:pt-2 text-sm sm:text-xl font-bold text-[#53595b] !m-0">
                                    {doctor.doctor_name} - Summary
                                </h1> */}
                                <button
                                    className="text-gray-600 text-sm mb-4 text-left"
                                    onClick={() => {
                                        router.back();
                                    }}
                                >
                                    &lt; Back
                                </button>
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <label className="text-gray-600 uppercase text-sm tracking-wider">Search</label>
                                    <input
                                        type="text"
                                        placeholder=""
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        className="border border-gray-300 rounded-[7px] px-4 py-1 outline-none focus:ring-none focus:ring-blue-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto mt-[29px]">
                            <table className="doctor-summary-table min-w-[max-content] xl:min-w-[auto] w-full text-left border border-[#aeaaac] rounded-[20px] border-separate" cellPadding={0} cellSpacing={0}>
                                <thead className="bg-customBg">
                                    <tr className="border-b">
                                        <th className="py-3 px-4 text-left text-[#53595B] font-normal rounded-tl-[20px] border-b border-[#aeaaac] w-[10%]">Date</th>
                                        <th className="py-3 px-4 font-normal border-b border-[#aeaaac]">Patient</th>
                                        <th className="py-3 px-4 font-normal border-b border-[#aeaaac] ">Item(s)</th>
                                        <th className="py-3 px-4 font-normal border-b border-[#aeaaac] ">%Earning</th>
                                        <th className="py-3 px-4 font-normal border-b border-[#aeaaac] ">Earned</th>
                                        <th className="py-3 px-4 font-normal border-b border-[#aeaaac] rounded-tr-[20px]"></th>
                                    </tr>
                                </thead>
                                        <tbody>
                                              {loading2 ? (
                                                <tr>
                                                  <td colSpan={7} className="text-center py-6 h-[300px]">
                                                    <Loader />
                                                  </td>
                                                </tr>
                                              ) : doctor?.plans?.length === 0 ? (
                                                <tr>
                                                  <td colSpan={7} className="text-center text-gray-500 py-6">
                                                    No records found.
                                                  </td>
                                                </tr>
                                              ) : (
                                                doctor.plans.map((plan, index) => (
                                                  <React.Fragment key={index}>
                                                    <tr className={`
                                                      cursor-pointer hover:bg-gray-100
                                                      ${(openAccordionIndex !== index) ? 'border-b' : ''}
                                                      ${index !== 0 ? 'border-t border-[#aeaaac]' : ''}
                                                    `}>
                                                      <td className={`py-3 px-4 font-normal ${(openAccordionIndex !== index) ? 'border-b' : ''} border-[#aeaaac] w-[10%]`}>
                                                        {formatDate(plan.date)}
                                                      </td>
                                                      <td className={`py-3 px-4 font-normal ${(openAccordionIndex !== index) ? 'border-b' : ''} border-[#aeaaac] w-[10%]`}>
                                                        {plan?.patient?.firstName} {plan?.patient?.lastName}
                                                      </td>
                                                      <td className={`py-3 px-4 font-normal ${(openAccordionIndex !== index) ? 'border-b' : ''} border-[#aeaaac] w-[20%]`}>
                                                        {plan?.patient?.items?.[0]?.productName}
                                                      </td>
                                                     
                                                      <td className={`py-3 px-4 font-normal ${(openAccordionIndex !== index) ? 'border-b' : ''} border-[#aeaaac] w-[8%]`}>
                                                        {plan?.doctorCommission || "0.00"}%
                                                      </td>
                                                      <td className={`py-3 px-4 font-normal ${(openAccordionIndex !== index) ? 'border-b' : ''} border-[#aeaaac] w-[8%]`}>
                                                        ${plan?.patient?.items?.[0]?.per_item_earning || "0.00"}
                                                      </td>
                                                      <td className={`py-3 px-4 font-normal ${(openAccordionIndex !== index) ? 'border-b' : ''} border-[#aeaaac] text-right w-[8%]`}>
                                                        <button
                                                          onClick={() => toggleAccordion(index)}
                                                          className="inline-block align-middle w-[25px] h-[25px] transition-transform"
                                                        >
                                                          <span
                                                            className={`inline-block transition-transform duration-300 ${openAccordionIndex === index ? "rotate-90" : ""}`}
                                                          >
                                                            <NextArrowIcon />
                                                          </span>
                                                        </button>
                                                      </td>
                                                    </tr>
                                
                                                    {openAccordionIndex === index &&
                                                      plan?.patient?.items?.map((item, idx,array) => (
                                                        idx > 0 && (
                                                          <tr key={idx} className="bg-white">
                                                              <td
                                                                className={`px-4 py-3 text-gray-700 ${
                                                                  idx === array.length - 1 ? 'border-b' : ''
                                                                } border-[#aeaaac]`}
                                                              ></td>
                                                              <td
                                                                className={`px-4 py-3 text-gray-700 ${
                                                                  idx === array.length - 1 ? 'border-b' : ''
                                                                } border-[#aeaaac]`}
                                                              ></td>
                                                              <td
                                                                className={`px-4 py-3 text-gray-700 ${
                                                                  idx === array.length - 1 ? 'border-b' : ''
                                                                } border-[#aeaaac]`}
                                                              >
                                                                {item?.productName}
                                                              </td>
                                                              <td className={`px-4 py-3 text-gray-700 ${
                                                                  idx === array.length - 1 ? 'border-b' : ''
                                                                } border-[#aeaaac]`}
                                                              >
                                                                {plan?.doctorCommission || "-"}%
                                                              </td>
                                                              <td
                                                                className={`px-4 py-3 text-gray-700 ${
                                                                  idx === array.length - 1 ? 'border-b' : ''
                                                                } border-[#aeaaac]`}
                                                              >
                                                                ${item?.per_item_earning}
                                                              </td>
                                                              <td
                                                                className={`px-4 py-3 text-gray-700 ${
                                                                  idx === array.length - 1 ? 'border-b' : ''
                                                                } border-[#aeaaac]`}
                                                              ></td>
                                                            </tr>
                                                        )
                                                      ))}
                                                  </React.Fragment>
                                                ))
                                              )}
                                            </tbody>
                            </table>

                        </div>
                        <div className="flex justify-end items-center space-x-4 mt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => {
                                    let prev = page - 1;
                                    handlePagination(session?.user?.id, prev, searchQuery, limit)
                                }
                                }
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
                                onClick={() => {
                                    let next = page + 1
                                    handlePagination(session?.user?.id, next, searchQuery, limit)
                                }
                                }
                                className={`px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg transition duration-200 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-customBg2'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                        {/* <div className='flex justify-end py-4'>
                            <div className="text-[#53595b] text-base">
                                Total Earnings to Date:
                                <span className="font-semibold text"> ${doctor?.doctor_earnings?.toFixed(2)}</span>
                            </div>
                        </div> */}
                    </>
                )}
            </div>
        </AppLayout>
    );
}


