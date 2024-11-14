import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const LineChart = ({monthlyRevenueData }) => {
    // const monthlyRevenueData = [
    //     {
    //         year: 2024,
    //         month: 1, // January
    //         totalRevenue: 12000.50,
    //     },
    //     {
    //         year: 2024,
    //         month: 2, // February
    //         totalRevenue: 15000.75,
    //     },
    //     {
    //         year: 2024,
    //         month: 3, // March
    //         totalRevenue: 13500.30,
    //     },
    //     {
    //         year: 2024,
    //         month: 4, // April
    //         totalRevenue: 14500.90,
    //     },
    //     {
    //         year: 2024,
    //         month: 5, // May
    //         totalRevenue: 16000.20,
    //     },
    //     {
    //         year: 2024,
    //         month: 6, // June
    //         totalRevenue: 15500.60,
    //     },
    // ];

    // Prepare the data for the chart
    const labels = monthlyRevenueData.map((item) => `${item.month}/${item.year}`);
    const data = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Monthly Earnings',
                data: monthlyRevenueData.map((item) => item.totalRevenue),
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
        <div className="p-4 bg-[#F9F9F9] rounded-lg ">
            <h2 className="text-xl font-bold">Total Earnings: ${monthlyRevenueData.reduce((acc, curr) => acc + curr.totalRevenue, 0).toFixed(2)}</h2>
            <div className="relative">
                <Line data={data} options={options} height={70}/>
            </div>
        </div>
    );
};

export default LineChart;
