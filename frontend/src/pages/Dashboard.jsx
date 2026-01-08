import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, DollarSign, Package, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({
        productsCount: 0,
        totalValue: 0,
        lowStockCount: 0,
        categoriesCount: 0
    });
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('products/'),
                    api.get('categories/')
                ]);

                const products = productsRes.data;
                const totalValue = products.reduce((acc, curr) => acc + (parseFloat(curr.price) * curr.stock_quantity), 0);
                const lowStock = products.filter(p => p.stock_quantity < 10).length;

                setStats({
                    productsCount: products.length,
                    totalValue: totalValue.toFixed(2),
                    lowStockCount: lowStock,
                    categoriesCount: categoriesRes.data.length
                });

                // Prepare Chart Data (Category distribution)
                const catMap = {};
                products.forEach(p => {
                    const catName = p.category_name || 'Uncategorized';
                    catMap[catName] = (catMap[catName] || 0) + 1;
                });
                const data = Object.keys(catMap).map(key => ({ name: key, count: catMap[key] }));
                setChartData(data);

            } catch (error) {
                console.error("Error loading dashboard data", error);
            }
        };
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon, color }) => (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg flex items-center gap-4">
            <div className={`p-3 rounded-full ${color} bg-opacity-20 text-white child-svg`}>
                {icon}
            </div>
            <div>
                <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Products"
                    value={stats.productsCount}
                    icon={<Package size={24} className="text-blue-500" />}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Inventory Value"
                    value={`$${stats.totalValue}`}
                    icon={<DollarSign size={24} className="text-green-500" />}
                    color="bg-green-500"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStockCount}
                    icon={<AlertCircle size={24} className="text-red-500" />}
                    color="bg-red-500"
                />
                <StatCard
                    title="Active Categories"
                    value={stats.categoriesCount}
                    icon={<TrendingUp size={24} className="text-purple-500" />}
                    color="bg-purple-500"
                />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 shadow-lg">
                <h3 className="text-xl font-bold mb-4">Inventory by Category</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                itemStyle={{ color: '#F3F4F6' }}
                            />
                            <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
