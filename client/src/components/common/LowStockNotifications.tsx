import { useState } from 'react';
import { AlertTriangle, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { useLowStock } from '@/hooks/useLowStock';

export function LowStockNotifications() {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  
  const { data: lowStockData, isLoading } = useLowStock(10);

  if (isLoading || !isVisible || !lowStockData?.data.length) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span>Низкие остатки</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-orange-700 mb-3">
            Обнаружено {lowStockData.data.length} товар(ов) с низкими остатками:
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {lowStockData.data.slice(0, 5).map((item) => (
              <div key={`${item.id}-${item.warehouseName}`} className="flex items-center justify-between p-2 bg-white rounded border border-orange-200">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">
                    {item.productName}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.warehouseName}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="text-xs">
                    {item.quantity.toFixed(1)} {item.unitShortName}
                  </Badge>
                </div>
              </div>
            ))}
            
            {lowStockData.data.length > 5 && (
              <div className="text-center text-sm text-orange-600 pt-2">
                И еще {lowStockData.data.length - 5} товар(ов)...
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-orange-200">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-orange-700 border-orange-300 hover:bg-orange-100"
              onClick={() => navigate('/stock-balances')}
            >
              <Package className="h-4 w-4 mr-2" />
              Просмотреть все остатки
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
