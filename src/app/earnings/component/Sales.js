'use client'
import React, { useState ,useEffect} from 'react';
import { useSession } from 'next-auth/react';
import Loader from 'components/loader';
export default function Sales() {
  const { data: session } = useSession();

  const [totalPatients,setTotalPatients]=useState('')
  const [totalPlans,setTotalPlans]=useState('')
  const [totalSubscriptions,setTotalSubscriptions]=useState('')
  const [thisMonthEarning,setThisMonthEarning]=useState('')
  const [thisweekEarning,setThisWeekEarning]=useState('')
  const [dateEarning,setdateEarning]=useState('')
  const fetchData = async () => {
    try {

        const response = await fetch(`/api/sales/?userId=${session?.user?.id}`);
        if (!response.ok) {
            throw new Error("Failed to fetch doctors");
        }
      const data = await response.json();
    if (data) {
        setTotalPatients(data?.totalPatients)
        setTotalPlans(data?.totalPlans)
        setTotalSubscriptions(data?.currentSubcriptions)
        setThisMonthEarning(data?.currentMonthEarnings)
        setThisWeekEarning(data?.currentWeekEarnings)
        setdateEarning(data?.currentDayEarnings)
      }
    } catch (error) {
            console.log(error);
    }

  };
  const data = [
    { title: 'Total Patients Using BOVA', value: `${totalPatients}`},
    { title: 'Total of Plans', value: totalPlans },
    { title: 'Total Number of Subscriptions', value: totalSubscriptions },
    { title: 'Total Amount Earned this Month', value: '$ ' +thisMonthEarning },
    { title: 'Total Amount Earned this Week', value:  '$ ' + thisweekEarning  },
    { title: 'Total Amount Earned to Date', value:  '$ ' + dateEarning  },
  ];


useEffect(() => {
    fetchData()
}, []);


  const [openIndex, setOpenIndex] = useState(null);

  const togglePanel = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (



        <div className="w-full max-w-3xl bg-white rounded-lg border border-[#AFAAAC]">
          {data.map((item, index) => (
            <div key={index} className="p-2 md:px-3 md:py-4 border-b border-[#AFAAAC] last:border-b-0">
              <div
                className="flex justify-between items-center cursor-pointer"
                // onClick={() => togglePanel(index)}
                >
                <span className="font-medium">
                  {item.title}: <span className='font-bold text-xl'> {item.value} </span>
                </span>
                <svg
                  className={`w-5 h-5 transition-transform ${openIndex === index ? 'rotate-180' : ''
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
  );
}
