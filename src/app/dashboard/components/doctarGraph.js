import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ currentMonthEarning, graphData, graphMonths }) => {

    const labels = graphMonths.map((item) => `${item}`);
    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Monthly Earnings',
                data: graphData.map((data) => data),
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
        <div className="p-4 bg-[#F9F9F9] rounded-lg ">
            <div>
                <h3 className="text-xl md:text-2xl font-semibold mt-[29px] ml-[29px]">$ {currentMonthEarning}</h3>
                <p className="text-gray-500 ml-[29px]">Total Amount Earned this Month</p>
            </div>
            <div className="relative">
                <Line data={data} options={options} height={80} />
            </div>
        </div>
    );
};

export default LineChart;
