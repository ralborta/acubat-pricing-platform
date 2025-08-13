const express = require('express');
const Product = require('../models/Product');
const Simulation = require('../models/Simulation');
const Ruleset = require('../models/Ruleset');
const User = require('../models/User');
const { authenticateToken, auditLog } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Obtener estadísticas generales del dashboard
// @access  Private
router.get('/stats', authenticateToken, auditLog('get_dashboard_stats'), async (req, res) => {
  try {
    // Obtener estadísticas de productos
    const productStats = await Product.getMarginStats();
    
    // Obtener estadísticas de simulaciones
    const simulationStats = await Simulation.getStats();
    
    // Obtener estadísticas de rulesets
    const rulesetStats = await Ruleset.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalActive: { $sum: 1 },
          avgPriority: { $avg: '$priority' },
          totalExecutions: { $sum: '$performance.totalExecutions' }
        }
      }
    ]);

    // Obtener estadísticas de usuarios
    const userStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $gt: ['$lastLogin', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] }, 1, 0] } }
        }
      }
    ]);

    // Calcular métricas del dashboard
    const stats = {
      products: {
        total: productStats[0]?.totalProducts || 0,
        averageMargin: Math.round((productStats[0]?.avgMargin || 0) * 100) / 100,
        critical: productStats[0]?.criticalCount || 0,
        warning: productStats[0]?.warningCount || 0,
        optimal: productStats[0]?.optimalCount || 0
      },
      simulations: {
        total: simulationStats.reduce((sum, stat) => sum + stat.count, 0),
        completed: simulationStats.find(s => s._id === 'completed')?.count || 0,
        running: simulationStats.find(s => s._id === 'running')?.count || 0,
        failed: simulationStats.find(s => s._id === 'failed')?.count || 0
      },
      rulesets: {
        totalActive: rulesetStats[0]?.totalActive || 0,
        avgPriority: Math.round((rulesetStats[0]?.avgPriority || 0) * 100) / 100,
        totalExecutions: rulesetStats[0]?.totalExecutions || 0
      },
      users: {
        total: userStats[0]?.totalUsers || 0,
        active: userStats[0]?.activeUsers || 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      message: 'No se pudieron obtener las estadísticas del dashboard'
    });
  }
});

// @route   GET /api/dashboard/products-daily
// @desc    Obtener productos por día (últimos 7 días)
// @access  Private
router.get('/products-daily', authenticateToken, auditLog('get_products_daily'), async (req, res) => {
  try {
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const count = await Product.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      data.push({
        date: startOfDay.toISOString().split('T')[0],
        count
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error obteniendo productos por día:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      message: 'No se pudieron obtener los datos de productos por día'
    });
  }
});

// @route   GET /api/dashboard/margin-distribution
// @desc    Obtener distribución de márgenes
// @access  Private
router.get('/margin-distribution', authenticateToken, auditLog('get_margin_distribution'), async (req, res) => {
  try {
    const distribution = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $gte: ['$marginPercentage', 20] },
              then: 'optimal',
              else: {
                $cond: {
                  if: { $gte: ['$marginPercentage', 10] },
                  then: 'warning',
                  else: 'critical'
                }
              }
            }
          },
          count: { $sum: 1 },
          percentage: { $avg: '$marginPercentage' }
        }
      }
    ]);

    // Formatear datos para el gráfico
    const formattedData = {
      optimal: { count: 0, percentage: 0 },
      warning: { count: 0, percentage: 0 },
      critical: { count: 0, percentage: 0 }
    };

    distribution.forEach(item => {
      if (formattedData[item._id]) {
        formattedData[item._id] = {
          count: item.count,
          percentage: Math.round(item.percentage * 100) / 100
        };
      }
    });

    // Calcular porcentajes totales
    const total = Object.values(formattedData).reduce((sum, item) => sum + item.count, 0);
    
    Object.keys(formattedData).forEach(key => {
      formattedData[key].percentageOfTotal = total > 0 ? Math.round((formattedData[key].count / total) * 100) : 0;
    });

    res.json({
      success: true,
      data: formattedData
    });
  } catch (error) {
    console.error('Error obteniendo distribución de márgenes:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      message: 'No se pudo obtener la distribución de márgenes'
    });
  }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Obtener actividad reciente
// @access  Private
router.get('/recent-activity', authenticateToken, auditLog('get_recent_activity'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Obtener productos recientemente actualizados
    const recentProducts = await Product.find({ status: 'active' })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('name sku currentPrice marginPercentage updatedAt')
      .populate('updatedBy', 'name email');

    // Obtener simulaciones recientes
    const recentSimulations = await Simulation.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('name type status createdAt')
      .populate('createdBy', 'name email');

    // Obtener rulesets recientemente ejecutados
    const recentRulesets = await Ruleset.find({ 'performance.lastExecuted': { $exists: true } })
      .sort({ 'performance.lastExecuted': -1 })
      .limit(parseInt(limit))
      .select('name category performance.lastExecuted')
      .populate('createdBy', 'name email');

    const activity = {
      products: recentProducts,
      simulations: recentSimulations,
      rulesets: recentRulesets
    };

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error obteniendo actividad reciente:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      message: 'No se pudo obtener la actividad reciente'
    });
  }
});

// @route   GET /api/dashboard/performance-metrics
// @desc    Obtener métricas de rendimiento
// @access  Private
router.get('/performance-metrics', authenticateToken, auditLog('get_performance_metrics'), async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Métricas de productos
    const productMetrics = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$performance.revenue' },
          totalProfit: { $sum: '$performance.profit' },
          avgConversionRate: { $avg: '$performance.conversionRate' },
          totalSales: { $sum: '$performance.totalSales' }
        }
      }
    ]);

    // Métricas de simulaciones
    const simulationMetrics = await Simulation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSimulations: { $sum: 1 },
          avgExecutionTime: { $avg: '$executionTime.duration' },
          successRate: {
            $avg: {
              $cond: [{ $eq: ['$status', 'completed'] }, 100, 0]
            }
          }
        }
      }
    ]);

    // Métricas de rulesets
    const rulesetMetrics = await Ruleset.aggregate([
      {
        $match: {
          'performance.lastExecuted': { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalExecutions: { $sum: '$performance.totalExecutions' },
          avgSuccessRate: { $avg: '$performance.successRate' },
          totalProductsAffected: { $sum: '$performance.impactMetrics.productsAffected' }
        }
      }
    ]);

    const metrics = {
      period,
      startDate,
      endDate: now,
      products: {
        revenue: productMetrics[0]?.totalRevenue || 0,
        profit: productMetrics[0]?.totalProfit || 0,
        conversionRate: Math.round((productMetrics[0]?.avgConversionRate || 0) * 100) / 100,
        totalSales: productMetrics[0]?.totalSales || 0
      },
      simulations: {
        total: simulationMetrics[0]?.totalSimulations || 0,
        avgExecutionTime: Math.round(simulationMetrics[0]?.avgExecutionTime || 0),
        successRate: Math.round((simulationMetrics[0]?.successRate || 0) * 100) / 100
      },
      rulesets: {
        totalExecutions: rulesetMetrics[0]?.totalExecutions || 0,
        avgSuccessRate: Math.round((rulesetMetrics[0]?.avgSuccessRate || 0) * 100) / 100,
        totalProductsAffected: rulesetMetrics[0]?.totalProductsAffected || 0
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error obteniendo métricas de rendimiento:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      message: 'No se pudieron obtener las métricas de rendimiento'
    });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Obtener alertas y notificaciones
// @access  Private
router.get('/alerts', authenticateToken, auditLog('get_alerts'), async (req, res) => {
  try {
    const alerts = [];

    // Alertas de productos críticos
    const criticalProducts = await Product.find({
      marginPercentage: { $lt: 10 },
      status: 'active'
    }).limit(5);

    if (criticalProducts.length > 0) {
      alerts.push({
        type: 'critical',
        title: 'Productos con margen crítico',
        message: `${criticalProducts.length} productos tienen margen menor al 10%`,
        count: criticalProducts.length,
        items: criticalProducts.map(p => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          margin: p.marginPercentage
        }))
      });
    }

    // Alertas de simulaciones fallidas
    const failedSimulations = await Simulation.find({
      status: 'failed',
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }).limit(5);

    if (failedSimulations.length > 0) {
      alerts.push({
        type: 'warning',
        title: 'Simulaciones fallidas',
        message: `${failedSimulations.length} simulaciones fallaron en las últimas 24 horas`,
        count: failedSimulations.length,
        items: failedSimulations.map(s => ({
          id: s._id,
          name: s.name,
          type: s.type
        }))
      });
    }

    // Alertas de rulesets con bajo rendimiento
    const lowPerformanceRulesets = await Ruleset.find({
      isActive: true,
      'performance.successRate': { $lt: 80 },
      'performance.totalExecutions': { $gt: 10 }
    }).limit(5);

    if (lowPerformanceRulesets.length > 0) {
      alerts.push({
        type: 'info',
        title: 'Rulesets con bajo rendimiento',
        message: `${lowPerformanceRulesets.length} rulesets tienen tasa de éxito menor al 80%`,
        count: lowPerformanceRulesets.length,
        items: lowPerformanceRulesets.map(r => ({
          id: r._id,
          name: r.name,
          successRate: r.performance.successRate
        }))
      });
    }

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({
      error: 'Error en el servidor',
      message: 'No se pudieron obtener las alertas'
    });
  }
});

module.exports = router;
