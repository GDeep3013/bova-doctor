import React, { useState } from 'react';
import AppLayout from 'components/Applayout';


export default function Sales() {
  const data = [
    { title: 'Total Patients Using BOVA', value: '24' },
    { title: 'Total of Plans', value: '100' },
    { title: 'Total Number of Subscriptions ', value: '45' },
    { title: 'Total Amount Earned this Month', value: '$12,000.50' },
    { title: 'Total Amount Earned this Week', value: '$4,300.50' },
    { title: 'Total Amount Earned to Date', value: '$22,300.50' },
  ];
  const [openIndex, setOpenIndex] = useState(null);

  const togglePanel = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (

    <AppLayout>
      <div className="dashboard-outer flex">

        <div className='dashboard-right w-full'>


          <div className="min-h bg-gray-50 flex flex-col p-6">
            <h1 className="page-title pt-2 pb-3 text-2xl font-semibold">Sales</h1>
            <button className="text-gray-600 text-sm mb-4 text-left">&lt; Back</button>
            <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
              {data.map((item, index) => (
                <div key={index} className="p-4 border-b border-[#AFAAAC] last:border-b-0">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                  // onClick={() => togglePanel(index)}
                  >
                    <span className="font-medium">
                      {item.title} : {item.value}
                      {/* {openIndex === index ? item.value : ''} */}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${openIndex === index ? '' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {openIndex === index && (
                    <div className="mt-2 text-gray-700">{item.value}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
