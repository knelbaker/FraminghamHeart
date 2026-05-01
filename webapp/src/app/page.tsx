"use client";
import { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import DashboardClient from '@/components/DashboardClient';

export default function Home() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse('/framingham_heart_study.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        // Filter out empty rows
        const validData = results.data.filter((row: any) => row.age != null);
        setData(validData);
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base text-secondary font-mono text-sm">
        Loading Framingham dataset...
      </div>
    );
  }

  return <DashboardClient initialData={data} />;
}
