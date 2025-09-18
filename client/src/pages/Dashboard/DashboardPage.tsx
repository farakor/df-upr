import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  Inventory,
  Restaurant,
  AttachMoney,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: color,
            width: 56,
            height: 56,
            mr: 2,
          }}
        >
          {icon}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="body2" color="success.main">
              {trend}
            </Typography>
          )}
        </Box>
      </Box>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  const { state } = useAuth();

  const stats = [
    {
      title: 'Выручка за сегодня',
      value: '₽ 45,230',
      icon: <AttachMoney />,
      color: '#4caf50',
      trend: '+12% к вчера',
    },
    {
      title: 'Товаров в наличии',
      value: '1,234',
      icon: <Inventory />,
      color: '#2196f3',
    },
    {
      title: 'Блюд продано',
      value: '89',
      icon: <Restaurant />,
      color: '#ff9800',
      trend: '+5% к вчера',
    },
    {
      title: 'Средний чек',
      value: '₽ 508',
      icon: <TrendingUp />,
      color: '#9c27b0',
      trend: '+3% к вчера',
    },
  ];

  return (
    <Box>
      {/* Приветствие */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Добро пожаловать, {state.user?.firstName}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Вот краткий обзор вашего бизнеса на сегодня
        </Typography>
      </Box>

      {/* Статистические карточки */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Дополнительная информация */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              График продаж
            </Typography>
            <Box
              sx={{
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <Typography color="text.secondary">
                График будет реализован в следующих этапах
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Последние операции
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[
                { action: 'Продажа', item: 'Борщ украинский', amount: '₽ 250', time: '10:30' },
                { action: 'Поступление', item: 'Молоко 3.2%', amount: '50 л', time: '09:15' },
                { action: 'Продажа', item: 'Котлета с пюре', amount: '₽ 320', time: '08:45' },
              ].map((operation, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {operation.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {operation.item}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {operation.amount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {operation.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
