import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({ currentMonthEarning,graphMonth, graphValue }) => {
    // console.log('monthlyRevenueData',monthlyRevenueData)
    const monthlyRevenueData = [
        {
            year: 2024,
            month: 1, // January
            totalRevenue: 12000.50,
        },
        {
            year: 2024,
            month: 2, // February
            totalRevenue: 15000.75,
        },
        {
            year: 2024,
            month: 3, // March
            totalRevenue: 13500.30,
        },
        {
            year: 2024,
            month: 4, // April
            totalRevenue: 14500.90,
        },
        {
            year: 2024,
            month: 5, // May
            totalRevenue: 16000.20,
        },
        {
            year: 2024,
            month: 6, // June
            totalRevenue: 15500.60,
        },
    ];

    // Prepare the data for the chart
    const labels = graphMonth.map((month) => month);
    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Monthly Earnings',
                data: graphValue.map((value) => value),
                borderColor: '#151515', // Light gray for the line color
                backgroundColor: '#e5e5e5', // Light gray fill color
                tension: 0.4,
            },
        ],
    };

    // Static value for previous month's earnings (e.g., $12,000.50 for preview)
    const staticEarnings = 12000.50;

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
        <div className="p-4 bg-[#F9F9F9] rounded-lg w-full max-w-full">

            <div>
                <h3 className="text-base md:text-xl xl:text-2xl font-semibold">$ {Number(currentMonthEarning).toFixed(2)}</h3>
                <p className="text-gray-500">Total Amount Earned this Month</p>
            </div>
            <div className="relative w-full admin-graph">
                <Line data={data} options={options} height={70}  />
            </div>
        </div>
    );
};

export default LineChart;
