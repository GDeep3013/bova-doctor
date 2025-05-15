'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from 'components/Applayout';
import Loader from 'components/loader';
import { NextArrowIcon } from 'components/svg-icons/icons';

export default function DoctorDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAccordionIndex, setOpenAccordionIndex] = useState(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/doctors/doctor-sales-summary/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Doctor not found');
        return res.json();
      })
      .then((data) => {
        console.log('data',data)
        setDoctor(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching doctor data:', error);
        setLoading(false);
        setDoctor(null);
      });
  }, [id]);

  const toggleAccordion = (index) => {
    setOpenAccordionIndex(openAccordionIndex === index ? null : index);
  };

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
              <button className="absolute md:static bg-[#2c444b] text-white text-base px-2 sm:px-6 text-sm sm:text-md py-2 rounded-lg hover:bg-[#0b1214]">
                Review Plan (2)
              </button>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap justify-between items-end md:mt-[16px] mb-4">
              <div>
                <h2 className="page-title md:pt-2 text-[19px] sm:text-2xl">Doctor &apos; s Sales Summary</h2>
                <h1 className="page-title md:pt-2 text-sm sm:text-xl font-bold text-[#53595b] !m-0">
                  {doctor.doctor_name} - Summary
                </h1>
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
                    <th className="py-3 px-4 font-normal border-b border-[#aeaaac] ">Units Sold Per Plan</th>
                    <th className="py-3 px-4 font-normal border-b border-[#aeaaac] ">%Earning</th>
                    <th className="py-3 px-4 font-normal border-b border-[#aeaaac] ">Earned Per Plan</th>
                    <th className="py-3 px-4 font-normal border-b border-[#aeaaac] rounded-tr-[20px]"></th>
                  </tr>
                </thead>
                <tbody>
                 {doctor?.plans?.map((plan, index) => (
                  <React.Fragment key={index}>
                    <tr className="border-b border-[#aeaaac]">
                      <td className="px-4 py-3 text-gray-700 w-[10%]">
                        {formatDate(plan.date)} {/* Format the date */}
                      </td>
                      <td className="px-4 py-3 text-gray-700 w-[10%]">
                        {plan?.patient?.firstName} {plan?.patient?.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-700 w-[20%]">
                        {plan?.patient?.items?.[0]?.productName}
                      </td>
                      <td className="px-4 py-3 text-gray-700 w-[8%]">{plan?.patient?.items?.reduce((total, item) => total + item.quantity, 0) || 0}</td>
                      <td className="px-4 py-3 text-gray-700 w-[8%]">{plan?.doctorCommission || "0.00"}%</td>
                      <td className="px-4 py-3 text-gray-700 w-[8%]">
                        ${plan?.patient?.items?.[0]?.per_item_earning ||"0.00"} {/* Calculate total earned */}
                      </td>
                      <td className="px-4 py-3 text-right w-[8%]">
                        <button
                          onClick={() => toggleAccordion(index)}
                          className="inline-block align-middle w-[25px] h-[25px] transition-transform"
                        >
                          <span
                            className={`inline-block transition-transform duration-300 ${openAccordionIndex === index ? 'rotate-90' : ''
                              }`}
                          >
                            <NextArrowIcon />
                          </span>
                        </button>
                      </td>
                    </tr>

                     {openAccordionIndex === index && (
                          plan?.patient?.items?.map((item, idx) => (
                            idx > 0 && (
                              <tr key={idx} className="bg-white">
                                <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]"></td>
                                <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]"></td>
                                <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">
                                  {item?.productName}
                                </td>
                                <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">{item?.quantity || '-'}</td>
                                <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">
                                  {plan?.doctorCommission || '-'}%
                                </td>
                                <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]">
                                  ${item?.per_item_earning}
                                </td>
                                <td className="px-4 py-3 text-gray-700 border-b border-[#aeaaac]"></td>
                              </tr>
                            )
                          ))
                        )}
                  </React.Fragment>
                ))}
                </tbody>
                  </table>
                
                </div>
                <div className='flex justify-end py-4'>
                  <div class="text-[#53595b] text-base">
                    Total Earnings to Date:
                    <span class="font-semibold text"> ${doctor?.doctor_earnings?.toFixed(2)}</span>
                  </div>
                </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
