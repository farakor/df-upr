import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { Loader2, Download, FileText, BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useReports } from '../../hooks/useReports';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useCategories } from '../../hooks/useCategories';
import { TurnoverReportTable } from './components/TurnoverReportTable';
import { ProfitabilityReportTable } from './components/ProfitabilityReportTable';
import { AbcAnalysisChart } from './components/AbcAnalysisChart';
import { XyzAnalysisChart } from './components/XyzAnalysisChart';
import { SalesReportChart } from './components/SalesReportChart';
import { StockReportTable } from './components/StockReportTable';

interface ReportFilters {
  startDate: string;
  endDate: string;
  warehouseId: string;
  categoryId: string;
  analysisType: string;
  groupBy: string;
  lowStock: boolean;
}

const ReportsPage: React.FC = () => {
  const {
    reportTypes,
    turnoverData,
    profitabilityData,
    abcData,
    xyzData,
    salesData,
    stockData,
    loading,
    error,
    fetchReportTypes,
    fetchTurnoverReport,
    fetchProfitabilityReport,
    fetchAbcAnalysis,
    fetchXyzAnalysis,
    fetchSalesReport,
    fetchStockReport,
    exportToExcel,
    exportToPdf,
    clearError,
  } = useReports();

  const { data: warehouses } = useWarehouses();
  const { data: categories } = useCategories();

  const [activeTab, setActiveTab] = useState('turnover');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 дней назад
    endDate: new Date().toISOString().split('T')[0], // сегодня
    warehouseId: 'all',
    categoryId: 'all',
    analysisType: 'revenue',
    groupBy: 'day',
    lowStock: false,
  });

  useEffect(() => {
    fetchReportTypes();
  }, [fetchReportTypes]);

  const handleFilterChange = (key: keyof ReportFilters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const generateReport = async () => {
    try {
      clearError();
      
      const baseFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        warehouseId: filters.warehouseId !== 'all' ? Number(filters.warehouseId) : undefined,
        categoryId: filters.categoryId !== 'all' ? Number(filters.categoryId) : undefined,
      };

      switch (activeTab) {
        case 'turnover':
          await fetchTurnoverReport(baseFilters);
          break;
        case 'profitability':
          await fetchProfitabilityReport(baseFilters);
          break;
        case 'abc':
          await fetchAbcAnalysis({
            ...baseFilters,
            analysisType: filters.analysisType as 'revenue' | 'quantity' | 'profit',
          });
          break;
        case 'xyz':
          await fetchXyzAnalysis(baseFilters);
          break;
        case 'sales':
          await fetchSalesReport({
            ...baseFilters,
            groupBy: filters.groupBy as 'day' | 'week' | 'month',
          });
          break;
        case 'stock':
          await fetchStockReport({
            warehouseId: filters.warehouseId !== 'all' ? Number(filters.warehouseId) : undefined,
            categoryId: filters.categoryId !== 'all' ? Number(filters.categoryId) : undefined,
            lowStock: filters.lowStock,
          });
          break;
      }
    } catch (error) {
      console.error('Ошибка при генерации отчета:', error);
    }
  };

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const exportParams = {
        reportType: activeTab,
        startDate: filters.startDate,
        endDate: filters.endDate,
        warehouseId: filters.warehouseId !== 'all' ? Number(filters.warehouseId) : undefined,
        categoryId: filters.categoryId !== 'all' ? Number(filters.categoryId) : undefined,
        analysisType: filters.analysisType,
        groupBy: filters.groupBy,
        lowStock: filters.lowStock,
      };

      if (format === 'excel') {
        await exportToExcel(exportParams);
      } else {
        await exportToPdf(exportParams);
      }
    } catch (error) {
      console.error(`Ошибка при экспорте в ${format}:`, error);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'turnover':
        return <BarChart3 className="w-4 h-4" />;
      case 'profitability':
        return <DollarSign className="w-4 h-4" />;
      case 'abc':
      case 'xyz':
        return <TrendingUp className="w-4 h-4" />;
      case 'sales':
        return <BarChart3 className="w-4 h-4" />;
      case 'stock':
        return <Package className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Отчеты и аналитика</h1>
          <p className="text-gray-600 mt-1">
            Комплексная система отчетности и анализа данных
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Параметры отчета
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="warehouse">Склад</Label>
              <Select
                value={filters.warehouseId}
                onValueChange={(value) => handleFilterChange('warehouseId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все склады" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все склады</SelectItem>
                  {warehouses?.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Категория</Label>
              <Select
                value={filters.categoryId}
                onValueChange={(value) => handleFilterChange('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={generateReport} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Сформировать отчет
                </>
              )}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={loading}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={loading}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-gray-100">
          <TabsTrigger value="turnover" className="flex items-center gap-2">
            {getTabIcon('turnover')}
            <span className="hidden sm:inline">Оборотка</span>
          </TabsTrigger>
          <TabsTrigger value="profitability" className="flex items-center gap-2">
            {getTabIcon('profitability')}
            <span className="hidden sm:inline">Рентабельность</span>
          </TabsTrigger>
          <TabsTrigger value="abc" className="flex items-center gap-2">
            {getTabIcon('abc')}
            <span className="hidden sm:inline">ABC анализ</span>
          </TabsTrigger>
          <TabsTrigger value="xyz" className="flex items-center gap-2">
            {getTabIcon('xyz')}
            <span className="hidden sm:inline">XYZ анализ</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            {getTabIcon('sales')}
            <span className="hidden sm:inline">Продажи</span>
          </TabsTrigger>
          <TabsTrigger value="stock" className="flex items-center gap-2">
            {getTabIcon('stock')}
            <span className="hidden sm:inline">Остатки</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="turnover">
          <Card>
            <CardHeader>
              <CardTitle>Оборотно-сальдовая ведомость</CardTitle>
            </CardHeader>
            <CardContent>
              <TurnoverReportTable data={turnoverData} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability">
          <Card>
            <CardHeader>
              <CardTitle>Отчет по рентабельности</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfitabilityReportTable data={profitabilityData} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abc">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  ABC анализ товаров
                  <Select
                    value={filters.analysisType}
                    onValueChange={(value) => handleFilterChange('analysisType', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">По выручке</SelectItem>
                      <SelectItem value="quantity">По количеству</SelectItem>
                      <SelectItem value="profit">По прибыли</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AbcAnalysisChart data={abcData} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="xyz">
          <Card>
            <CardHeader>
              <CardTitle>XYZ анализ товаров</CardTitle>
            </CardHeader>
            <CardContent>
              <XyzAnalysisChart data={xyzData} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Отчет по продажам
                  <Select
                    value={filters.groupBy}
                    onValueChange={(value) => handleFilterChange('groupBy', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">По дням</SelectItem>
                      <SelectItem value="week">По неделям</SelectItem>
                      <SelectItem value="month">По месяцам</SelectItem>
                    </SelectContent>
                  </Select>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SalesReportChart data={salesData} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Отчет по остаткам
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="lowStock"
                    checked={filters.lowStock}
                    onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="lowStock">Только низкие остатки</Label>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockReportTable data={stockData} loading={loading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
