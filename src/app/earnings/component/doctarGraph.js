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

    const [timePeriod, setTimePeriod] = useState('Year');
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
            // if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();

            if (data) {
                if (timePeriod === 'Month') {
                    const labels = data.map((entry) => `${entry.date}`);
                    const values = data.map((entry) => entry.totalRevenue);
                    setGraphLabels(labels);
                    setGraphData(values);
                } else if (timePeriod === 'Year') {
                    const labels = data.map((entry) => `${entry.month}`);
                    const values = data.map((entry) => entry.totalRevenue);
                    setGraphLabels(labels);
                    setGraphData(values);
                } else if (timePeriod === 'Custom') {
                    const labels = data.map((entry) => entry.date);
                    const values = data.map((entry) => entry.totalRevenue);
                    setGraphLabels(labels);
                    setGraphData(values);
                }
                setError('');
            } else {
                setError('Data is not available ');

            }
        } catch (error) {
            console.log('Error fetching data:', error.message);

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
        labels: graphLabels,
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
        options: {
            maintainAspectRatio: false,
        }
    };
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        let value = context.raw;
                        return `$ ${value.toFixed(2)}`;
                    },
                },
            },
        },
        layout: {
            padding: {
                bottom: 10,
            },
        },
        scales: {
            x: {
                type: 'category',
                display: true
            },
            y: {
                type: 'linear',
                min: 0,
                ticks: {
                    callback: function (value) {
                        return `$${value.toFixed(2)}`;
                    },
                },
                grid: {
                    drawBorder: true, // Ensure gridlines don't get clipped
                },
            },
        },
    };


    return (
        <div className="p-4 bg-[#F9F9F9] rounded-lg">
            <div className="flex">
                <div>
                    <h3 className="text-xl md:text-2xl text-[#53595B]  font-bold">
                        $ {graphData.reduce((sum, val) => sum + val, 0).toFixed(2)}
                    </h3>
                    <p className="text-gray-500">
                        Total Amount Earned this {timePeriod}
                    </p>
                </div>
                <div className="ml-auto">
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="text-gray-500 min-w-[150px] p-2 text-sm focus:outline-none select-arrow"
                    >
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                        <option value="Custom">Custom</option>
                    </select>
                </div>
            </div>
            {timePeriod === 'Custom' && (
                <div className="flex justify-end mt-4">
                    <div>
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
                        {error && <p className="text-red-500 text-sm mt-2 w-full text-right">{error}</p>}
                    </div>
                </div>
            )}

            <div className="relative mt-4">
                <Line data={data} options={options} height={80} className='!w-full' />
            </div>
        </div>

    );
};

export default LineChart;
