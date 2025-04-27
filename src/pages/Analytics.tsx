
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import StatsCard from '@/components/StatsCard';
import ShotChart from '@/components/ShotChart';
import { BarChart, ResponsiveContainer, XAxis, YAxis, Bar, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Game, Shot } from '@/lib/types';

const Analytics = () => {
  // Mock data for demonstration - replace with actual data fetching
  const mockGames: Game[] = [
    {
      id: "1",
      date: new Date().toISOString(),
      duration: 600,
      shots: [],
      stats: {
        totalShots: 50,
        madeShots: 30,
        twoPointAttempts: 35,
        twoPointMade: 20,
        threePointAttempts: 15,
        threePointMade: 10,
        shotPercentage: 60,
        twoPointPercentage: 57.1,
        threePointPercentage: 66.7
      }
    }
  ];

  const shotsByZone = [
    { zone: 'Paint', attempts: 25, makes: 15 },
    { zone: 'Mid-Range', attempts: 20, makes: 10 },
    { zone: 'Three Point', attempts: 15, makes: 8 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Analytics" showBack={true} />
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Shot Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Shots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockGames[0].stats.totalShots}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockGames[0].stats.shotPercentage.toFixed(1)}% shooting
                  </p>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">3PT Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockGames[0].stats.threePointPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mockGames[0].stats.threePointMade}/{mockGames[0].stats.threePointAttempts} made
                  </p>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">2PT Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mockGames[0].stats.twoPointPercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mockGames[0].stats.twoPointMade}/{mockGames[0].stats.twoPointAttempts} made
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Shot Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Shot Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shotsByZone}>
                    <XAxis dataKey="zone" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attempts" fill="#8884d8" name="Attempts" />
                    <Bar dataKey="makes" fill="#82ca9d" name="Makes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shot Chart</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ShotChart shots={mockGames[0].shots} width={400} height={300} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsCard stats={mockGames[0].stats} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
