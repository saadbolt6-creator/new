import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { apiService, DeviceChartData, HierarchyChartData, Device } from '../../services/api';
import FigmaMetricsCards from './FigmaMetricsCards';
import FigmaTopRegionsChart from './FigmaTopRegionsChart';
import FigmaGVFWLRCharts from './FigmaGVFWLRCharts';
import FigmaProductionMap from './FigmaProductionMap';
import FigmaFlowRateCharts from './FigmaFlowRateCharts';

interface DashboardContentProps {
  children?: React.ReactNode;
  selectedDevice?: Device | null;
  selectedHierarchy?: any | null;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  children, 
  selectedDevice, 
  selectedHierarchy 
}) => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<DeviceChartData | null>(null);
  const [hierarchyChartData, setHierarchyChartData] = useState<HierarchyChartData | null>(null);
  const [timeRange, setTimeRange] = useState('day');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load chart data when a device or hierarchy is selected
    if (selectedDevice && !selectedHierarchy) {
      loadDeviceChartData(String(selectedDevice.id));
      setHierarchyChartData(null); // Clear hierarchy data
    } else if (selectedHierarchy && !selectedDevice) {
      loadHierarchyChartData(String(selectedHierarchy.id));
      setChartData(null); // Clear device data
    }
  }, [selectedDevice, selectedHierarchy, timeRange, token]);

  const loadDeviceChartData = async (deviceId: string) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getDeviceChartData(deviceId, timeRange, token);
      if (response.success && response.data) {
        setChartData(response.data);
      }
    } catch (error) {
      console.error('Failed to load device chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHierarchyChartData = async (hierarchyId: string) => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await apiService.getHierarchyChartData(hierarchyId, timeRange, token);
      if (response.success && response.data) {
        setHierarchyChartData(response.data);
      }
    } catch (error) {
      console.error('Failed to load hierarchy chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 bg-[#1E1F2E] min-h-screen">
      {children || (
        <>
          {/* Metrics Cards */}
          <FigmaMetricsCards />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Top Regions Chart */}
            <div className="col-span-7">
              <FigmaTopRegionsChart />
            </div>
            
            {/* GVF/WLR Charts */}
            <div className="col-span-5">
              <FigmaGVFWLRCharts />
            </div>
          </div>

          {/* Production Map */}
          <div className="mb-6">
            <FigmaProductionMap />
          </div>
          
          {/* Flow Rate Charts */}
          <FigmaFlowRateCharts chartData={chartData} hierarchyChartData={hierarchyChartData} />
        </>
      )}
    </div>
  );
};

export default DashboardContent;