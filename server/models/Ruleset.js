const mongoose = require('mongoose');

const rulesetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del ruleset es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  category: {
    type: String,
    enum: ['pricing', 'discount', 'promotion', 'seasonal', 'competitive', 'custom'],
    required: true
  },
  priority: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  conditions: [{
    field: {
      type: String,
      required: true,
      enum: [
        'category',
        'price',
        'margin',
        'demand',
        'season',
        'competitor_price',
        'inventory',
        'customer_segment',
        'geographic_region',
        'sales_channel'
      ]
    },
    operator: {
      type: String,
      required: true,
      enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'contains', 'not_contains', 'in_range', 'not_in_range']
    },
    value: mongoose.Schema.Types.Mixed,
    value2: mongoose.Schema.Types.Mixed, // Para rangos
    unit: String // Para valores monetarios, porcentajes, etc.
  }],
  actions: [{
    type: {
      type: String,
      required: true,
      enum: [
        'set_price',
        'adjust_price',
        'set_margin',
        'adjust_margin',
        'apply_discount',
        'set_priority',
        'change_status',
        'add_tag',
        'remove_tag',
        'notify_user'
      ]
    },
    target: {
      type: String,
      required: true,
      enum: ['product', 'category', 'all_matching']
    },
    value: mongoose.Schema.Types.Mixed,
    valueType: {
      type: String,
      enum: ['absolute', 'percentage', 'fixed_amount']
    },
    description: String
  }],
  schedule: {
    isScheduled: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    endDate: Date,
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly', 'yearly']
    },
    timeZone: {
      type: String,
      default: 'UTC'
    }
  },
  performance: {
    totalExecutions: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastExecuted: Date,
    averageExecutionTime: {
      type: Number,
      default: 0
    },
    impactMetrics: {
      productsAffected: { type: Number, default: 0 },
      revenueImpact: { type: Number, default: 0 },
      marginImpact: { type: Number, default: 0 }
    }
  },
  validation: {
    isValid: {
      type: Boolean,
      default: true
    },
    validationErrors: [{
      field: String,
      message: String,
      severity: {
        type: String,
        enum: ['warning', 'error', 'critical']
      }
    }],
    lastValidated: Date
  },
  dependencies: [{
    rulesetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ruleset'
    },
    dependencyType: {
      type: String,
      enum: ['prerequisite', 'conflict', 'enhancement']
    },
    description: String
  }],
  metadata: {
    version: {
      type: String,
      default: '1.0.0'
    },
    tags: [String],
    author: String,
    department: String,
    costCenter: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true
});

// Índices
rulesetSchema.index({ name: 1 });
rulesetSchema.index({ category: 1 });
rulesetSchema.index({ priority: -1 });
rulesetSchema.index({ isActive: 1 });
rulesetSchema.index({ 'conditions.field': 1 });
rulesetSchema.index({ createdBy: 1 });
rulesetSchema.index({ createdAt: -1 });

// Middleware pre-save para validar reglas
rulesetSchema.pre('save', function(next) {
  this.validateRules();
  next();
});

// Método para validar reglas
rulesetSchema.methods.validateRules = function() {
  const errors = [];
  
  // Validar que haya al menos una condición
  if (!this.conditions || this.conditions.length === 0) {
    errors.push({
      field: 'conditions',
      message: 'Debe haber al menos una condición',
      severity: 'error'
    });
  }
  
  // Validar que haya al menos una acción
  if (!this.actions || this.actions.length === 0) {
    errors.push({
      field: 'actions',
      message: 'Debe haber al menos una acción',
      severity: 'error'
    });
  }
  
  // Validar condiciones
  this.conditions.forEach((condition, index) => {
    if (!condition.field || !condition.operator || condition.value === undefined) {
      errors.push({
        field: `conditions[${index}]`,
        message: 'Condición incompleta',
        severity: 'error'
      });
    }
  });
  
  // Validar acciones
  this.actions.forEach((action, index) => {
    if (!action.type || !action.target || action.value === undefined) {
      errors.push({
        field: `actions[${index}]`,
        message: 'Acción incompleta',
        severity: 'error'
      });
    }
  });
  
  this.validation.isValid = errors.length === 0;
  this.validation.validationErrors = errors;
  this.validation.lastValidated = new Date();
};

// Método para ejecutar reglas
rulesetSchema.methods.execute = async function(product, context = {}) {
  try {
    // Verificar si las reglas se aplican al producto
    if (!this.evaluateConditions(product, context)) {
      return { applied: false, reason: 'No se cumplen las condiciones' };
    }
    
    // Aplicar acciones
    const results = await this.applyActions(product, context);
    
    // Actualizar métricas de rendimiento
    this.performance.totalExecutions += 1;
    this.performance.lastExecuted = new Date();
    
    await this.save();
    
    return { applied: true, results };
  } catch (error) {
    this.performance.totalExecutions += 1;
    await this.save();
    throw error;
  }
};

// Método para evaluar condiciones
rulesetSchema.methods.evaluateConditions = function(product, context) {
  return this.conditions.every(condition => {
    const fieldValue = this.getFieldValue(product, context, condition.field);
    return this.evaluateCondition(fieldValue, condition);
  });
};

// Método para obtener valor del campo
rulesetSchema.methods.getFieldValue = function(product, context, field) {
  if (field === 'category') return product.category;
  if (field === 'price') return product.currentPrice;
  if (field === 'margin') return product.marginPercentage;
  if (field === 'demand') return context.demand || 'medium';
  if (field === 'season') return context.season || 'none';
  if (field === 'competitor_price') return context.competitorPrice;
  if (field === 'inventory') return context.inventory;
  if (field === 'customer_segment') return context.customerSegment;
  if (field === 'geographic_region') return context.geographicRegion;
  if (field === 'sales_channel') return context.salesChannel;
  return null;
};

// Método para evaluar una condición individual
rulesetSchema.methods.evaluateCondition = function(fieldValue, condition) {
  if (fieldValue === null || fieldValue === undefined) return false;
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
    case 'not_equals':
      return fieldValue !== condition.value;
    case 'greater_than':
      return fieldValue > condition.value;
    case 'less_than':
      return fieldValue < condition.value;
    case 'greater_equal':
      return fieldValue >= condition.value;
    case 'less_equal':
      return fieldValue <= condition.value;
    case 'contains':
      return String(fieldValue).includes(condition.value);
    case 'not_contains':
      return !String(fieldValue).includes(condition.value);
    case 'in_range':
      return fieldValue >= condition.value && fieldValue <= condition.value2;
    case 'not_in_range':
      return fieldValue < condition.value || fieldValue > condition.value2;
    default:
      return false;
  }
};

// Método para aplicar acciones
rulesetSchema.methods.applyActions = async function(product, context) {
  const results = [];
  
  for (const action of this.actions) {
    try {
      const result = await this.applyAction(product, action, context);
      results.push(result);
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }
  
  return results;
};

// Método para aplicar una acción individual
rulesetSchema.methods.applyAction = async function(product, action, context) {
  switch (action.type) {
    case 'set_price':
      const newPrice = action.valueType === 'percentage' 
        ? product.currentPrice * (1 + action.value / 100)
        : action.value;
      product.currentPrice = newPrice;
      break;
      
    case 'adjust_price':
      const adjustment = action.valueType === 'percentage'
        ? product.currentPrice * (action.value / 100)
        : action.value;
      product.currentPrice += adjustment;
      break;
      
    case 'set_margin':
      if (product.costPrice > 0) {
        const targetMargin = action.value / 100;
        product.currentPrice = product.costPrice / (1 - targetMargin);
      }
      break;
      
    case 'apply_discount':
      const discount = action.valueType === 'percentage'
        ? product.currentPrice * (action.value / 100)
        : action.value;
      product.currentPrice -= discount;
      break;
      
    case 'set_priority':
      product.priority = action.value;
      break;
      
    case 'change_status':
      product.status = action.value;
      break;
      
    case 'add_tag':
      if (!product.tags.includes(action.value)) {
        product.tags.push(action.value);
      }
      break;
      
    case 'remove_tag':
      product.tags = product.tags.filter(tag => tag !== action.value);
      break;
  }
  
  await product.save();
  return { success: true, action: action.type, productId: product._id };
};

// Método estático para encontrar rulesets activos
rulesetSchema.statics.findActive = function() {
  return this.find({ isActive: true, 'validation.isValid': true }).sort({ priority: -1 });
};

// Método estático para encontrar rulesets por categoría
rulesetSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ priority: -1 });
};

module.exports = mongoose.model('Ruleset', rulesetSchema);
