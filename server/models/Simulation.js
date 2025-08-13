const mongoose = require('mongoose');

const simulationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la simulación es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  type: {
    type: String,
    enum: ['pricing_analysis', 'margin_optimization', 'competitor_analysis', 'scenario_testing'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    currentPrice: Number,
    proposedPrice: Number,
    currentMargin: Number,
    proposedMargin: Number,
    impact: Number, // Cambio en margen
    risk: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  rulesets: [{
    rulesetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruleset'
    },
    priority: Number,
    isActive: Boolean
  }],
  parameters: {
    targetMargin: {
      type: Number,
      min: 0,
      max: 1000
    },
    maxPriceIncrease: {
      type: Number,
      min: 0,
      max: 100
    },
    maxPriceDecrease: {
      type: Number,
      min: 0,
      max: 100
    },
    competitorPrices: [{
      competitor: String,
      price: Number,
      source: String
    }],
    marketConditions: {
      demand: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      seasonality: {
        type: String,
        enum: ['none', 'low', 'medium', 'high']
      },
      economicFactor: {
        type: String,
        enum: ['recession', 'stable', 'growth']
      }
    }
  },
  results: {
    totalProducts: {
      type: Number,
      default: 0
    },
    productsModified: {
      type: Number,
      default: 0
    },
    averagePriceChange: {
      type: Number,
      default: 0
    },
    averageMarginChange: {
      type: Number,
      default: 0
    },
    totalRevenueImpact: {
      type: Number,
      default: 0
    },
    totalProfitImpact: {
      type: Number,
      default: 0
    },
    riskDistribution: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      critical: { type: Number, default: 0 }
    },
    recommendations: [{
      type: String,
      priority: String,
      description: String,
      impact: String
    }]
  },
  executionTime: {
    startTime: Date,
    endTime: Date,
    duration: Number // en milisegundos
  },
  logs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'error', 'debug']
    },
    message: String,
    details: mongoose.Schema.Types.Mixed
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices
simulationSchema.index({ status: 1 });
simulationSchema.index({ type: 1 });
simulationSchema.index({ createdBy: 1 });
simulationSchema.index({ createdAt: -1 });
simulationSchema.index({ 'products.productId': 1 });
simulationSchema.index({ 'rulesets.rulesetId': 1 });

// Middleware pre-save para calcular duración
simulationSchema.pre('save', function(next) {
  if (this.executionTime.startTime && this.executionTime.endTime) {
    this.executionTime.duration = this.executionTime.endTime - this.executionTime.startTime;
  }
  next();
});

// Método para iniciar simulación
simulationSchema.methods.start = function() {
  this.status = 'running';
  this.executionTime.startTime = new Date();
  this.logs.push({
    level: 'info',
    message: 'Simulación iniciada',
    details: { timestamp: new Date() }
  });
  return this.save();
};

// Método para completar simulación
simulationSchema.methods.complete = function(results) {
  this.status = 'completed';
  this.executionTime.endTime = new Date();
  this.results = { ...this.results, ...results };
  this.logs.push({
    level: 'info',
    message: 'Simulación completada exitosamente',
    details: { results: this.results }
  });
  return this.save();
};

// Método para fallar simulación
simulationSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.executionTime.endTime = new Date();
  this.logs.push({
    level: 'error',
    message: 'Simulación falló',
    details: { error: error.message || error }
  });
  return this.save();
};

// Método para cancelar simulación
simulationSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.executionTime.endTime = new Date();
  this.logs.push({
    level: 'warning',
    message: 'Simulación cancelada',
    details: { reason }
  });
  return this.save();
};

// Método estático para obtener simulaciones por estado
simulationSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

// Método estático para obtener simulaciones del usuario
simulationSchema.statics.findByUser = function(userId) {
  return this.find({ createdBy: userId }).sort({ createdAt: -1 });
};

// Método estático para obtener estadísticas de simulaciones
simulationSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$executionTime.duration' }
      }
    }
  ]);
};

module.exports = mongoose.model('Simulation', simulationSchema);
