import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ currentMonthEarning, graphData, graphMonths, timePeriod, setTimePeriod }) => {

    // Handle case where graphMonths or graphData might be empty or undefined
    const labels = graphMonths ? graphMonths.map((item) => `${item}`) : [];
    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: `${timePeriod} Earnings`,  // Display timePeriod correctly
                data: graphData ? graphData : [],  // Safe check for graphData
                borderColor: '#151515',
                backgroundColor: '#e5e5e5',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false },
        },
        scales: {
            x: { display: false },
            y: { display: false },
        },
    };

    return (
        <div className="p-4 bg-[#F9F9F9] rounded-lg max-[1279px]:mt-5 ">
            <div className='flex'>
                <div className='w-full'>
                    <h3 className="text-xl md:text-2xl font-semibold mt-[0]">${currentMonthEarning}</h3>
                    <p className="text-gray-500">Total Amount Earned this {timePeriod}</p> {/* Dynamically update for each period */}
                </div>
                <div className='ml-[306px]'>
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)} // Set timePeriod based on user input
                        className="text-gray-500 min-w-[150px] p-2 text-sm focus:outline-none"
                    >
                        <option value="Weeks">Weeks</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                    </select>
                </div>
            </div>
            <div className="relative">
                <Line data={data} options={options} height={80} />
            </div>
        </div>
    );
};

export default LineChart;
