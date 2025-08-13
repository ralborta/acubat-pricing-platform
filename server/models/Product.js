const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  sku: {
    type: String,
    required: [true, 'El SKU es requerido'],
    unique: true,
    uppercase: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['telecom', 'insurance', 'banking', 'retail', 'utilities', 'other']
  },
  basePrice: {
    type: Number,
    required: [true, 'El precio base es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  currentPrice: {
    type: Number,
    required: [true, 'El precio actual es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  costPrice: {
    type: Number,
    required: [true, 'El precio de costo es requerido'],
    min: [0, 'El precio de costo no puede ser negativo']
  },
  margin: {
    type: Number,
    required: true,
    min: [-100, 'El margen no puede ser menor a -100%'],
    max: [1000, 'El margen no puede ser mayor a 1000%']
  },
  marginPercentage: {
    type: Number,
    required: true,
    min: [-100, 'El porcentaje de margen no puede ser menor a -100%'],
    max: [1000, 'El porcentaje de margen no puede ser mayor a 1000%']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'discontinued', 'pending'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  metadata: {
    supplier: String,
    brand: String,
    model: String,
    warranty: String,
    dimensions: String,
    weight: Number
  },
  pricingRules: [{
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruleset'
    },
    ruleName: String,
    priority: Number,
    isActive: Boolean
  }],
  historicalPrices: [{
    price: Number,
    date: {
      type: Date,
      default: Date.now
    },
    reason: String,
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  performance: {
    totalSales: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    },
    profit: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  lastSimulation: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ priority: 1 });
productSchema.index({ margin: 1 });
productSchema.index({ 'pricingRules.ruleId': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ updatedAt: -1 });

// Middleware pre-save para calcular márgenes
productSchema.pre('save', function(next) {
  if (this.isModified('currentPrice') || this.isModified('costPrice')) {
    if (this.costPrice > 0) {
      this.margin = this.currentPrice - this.costPrice;
      this.marginPercentage = ((this.margin / this.costPrice) * 100);
    } else {
      this.margin = 0;
      this.marginPercentage = 0;
    }
  }
  next();
});

// Método para actualizar precio con historial
productSchema.methods.updatePrice = function(newPrice, reason, userId) {
  this.historicalPrices.push({
    price: this.currentPrice,
    date: new Date(),
    reason: 'Actualización automática',
    appliedBy: this.updatedBy
  });
  
  this.currentPrice = newPrice;
  this.updatedBy = userId;
  this.updatedAt = new Date();
  
  return this.save();
};

// Método para obtener productos críticos (margen bajo)
productSchema.statics.findCritical = function() {
  return this.find({
    marginPercentage: { $lt: 10 },
    status: 'active'
  }).sort({ marginPercentage: 1 });
};

// Método para obtener productos óptimos (margen alto)
productSchema.statics.findOptimal = function() {
  return this.find({
    marginPercentage: { $gte: 20 },
    status: 'active'
  }).sort({ marginPercentage: -1 });
};

// Método para obtener estadísticas de márgenes
productSchema.statics.getMarginStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        avgMargin: { $avg: '$marginPercentage' },
        minMargin: { $min: '$marginPercentage' },
        maxMargin: { $max: '$marginPercentage' },
        totalProducts: { $sum: 1 },
        criticalCount: {
          $sum: { $cond: [{ $lt: ['$marginPercentage', 10] }, 1, 0] }
        },
        warningCount: {
          $sum: { $cond: [{ $and: [{ $gte: ['$marginPercentage', 10] }, { $lt: ['$marginPercentage', 20] }] }, 1, 0] }
        },
        optimalCount: {
          $sum: { $cond: [{ $gte: ['$marginPercentage', 20] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Product', productSchema);
