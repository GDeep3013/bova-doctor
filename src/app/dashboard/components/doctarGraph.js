import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useSession } from 'next-auth/react';

import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const LineChart = () => {
    const { data: session } = useSession();

    const currentYear = new Date().getFullYear();

    const [timePeriod, setTimePeriod] = useState('Month');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [graphData, setGraphData] = useState([]);
    const [graphLabels, setGraphLabels] = useState([]);

    const [graphMonths, setGraphMonths] = useState([]);
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            let query = `?userId=${session?.user?.id}&timePeriod=${timePeriod}`;
            if (timePeriod == 'Custom') {
                if (!startDate && !endDate) {
                    setError('Start Date and End Date are required');
                    return;  
                } else {
                    query += `&startDate=${startDate}&endDate=${endDate}`;

                }
                
            }
    
            const response = await fetch(`/api/doctors/dashboard/earnings${query}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            
            const data = await response.json();
            if (data) {
                if (timePeriod === 'Month') {
                    // Extract monthly data
                    const labels = data.map((entry) => `${entry.date}`); // Example: ["Jan 2024", "Feb 2024", ...]
                    const values = data.map((entry) => entry.totalRevenue); // Example: [0, 0, ...]
                    setGraphLabels(labels);
                    setGraphData(values);
                } else if (timePeriod === 'Year') {
                    // Extract yearly data
                    const labels = data.map((entry) => `${entry.month}`); // Example: ["2024", "2025", ...]
                    const values = data.map((entry) => entry.totalRevenue); // Example: [1000, 2000, ...]
                    setGraphLabels(labels);
                    setGraphData(values);
                } else if (timePeriod === 'Custom') {
                    // Extract custom data
                    const labels = data.map((entry) => entry.date); // Example: ["2024-11-01", "2024-11-02", ...]
                    const values = data.map((entry) => entry.totalRevenue); // Example: [0, 50, ...]
                    setGraphLabels(labels);
                    setGraphData(values);
                }
                setError('');
            } else {
                setError('Data is not available or malformed');
            }
        } catch (error) {
            console.error('Error fetching data:', error.message);
        }
    };

    useEffect(() => {
        if (timePeriod === 'Custom' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (end <= start) {
                setError('End date must be greater than start date');
                return;
            }
            setError('');
        }
        fetchData();
    }, [timePeriod, startDate, endDate]);

    const labels = graphMonths.length > 0 ? graphMonths : [];

    const data = {
        labels:graphLabels,
        datasets: [
            {
                fill: true,
                label: `${timePeriod} Earnings`,
                data: graphData,
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
            tooltip: { enabled: true },
        },
        scales: {
            x: { type: 'category', display: true }, // Explicitly set the scale type
            y: { type: 'linear', display: true },
        },
    };

    return (
        <div className="p-4 bg-[#F9F9F9] rounded-lg">
            <div className="flex">
                <div>
                    <h3 className="text-xl md:text-2xl font-semibold mt-[29px] ml-[29px]">
                        ${graphData.reduce((sum, val) => sum + val, 0).toFixed(2)}
                    </h3>
                    <p className="text-gray-500 ml-[29px]">
                        Total Amount Earned this {timePeriod}
                    </p>
                </div>
                <div className="ml-auto">
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="text-gray-500 min-w-[150px] p-2 text-sm focus:outline-none"
                    >
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>
            </div>
            {timePeriod === 'Custom' && (
                <div className="flex mt-4">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 mr-2 text-sm focus:outline-none"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 text-sm focus:outline-none"
                    />
                </div>
            )}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="relative mt-4">
                <Line data={data} options={options} height={80} />
            </div>
        </div>
    );
};

export default LineChart;
