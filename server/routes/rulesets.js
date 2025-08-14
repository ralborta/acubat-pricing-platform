const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/rulesets - Listar rulesets
router.get('/', auth, async (req, res) => {
  try {
    // Por ahora retornamos datos mock
    const mockRulesets = [
      {
        id: 1,
        name: 'Reglas de Margen Básico',
        description: 'Reglas estándar para cálculo de márgenes',
        type: 'margin',
        status: 'active',
        rules: [
          { condition: 'margin < 20%', action: 'increase_price', value: 5 },
          { condition: 'margin > 50%', action: 'decrease_price', value: 3 }
        ],
        createdBy: req.user.id
      },
      {
        id: 2,
        name: 'Reglas de Competencia',
        description: 'Ajustes basados en precios de competencia',
        type: 'competition',
        status: 'active',
        rules: [
          { condition: 'competitor_price < price', action: 'decrease_price', value: 10 },
          { condition: 'competitor_price > price * 1.2', action: 'increase_price', value: 8 }
        ],
        createdBy: req.user.id
      }
    ];

    res.json({
      message: 'Rulesets obtenidos exitosamente',
      rulesets: mockRulesets,
      total: mockRulesets.length
    });

  } catch (error) {
    console.error('Error al obtener rulesets:', error);
    res.status(500).json({ 
      error: 'Error al obtener rulesets',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// POST /api/rulesets - Crear ruleset
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('El nombre es requerido y no puede exceder 100 caracteres'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('type').isIn(['margin', 'competition', 'seasonal', 'custom']).withMessage('Tipo de ruleset no válido'),
  body('rules').isArray().withMessage('Las reglas deben ser un array')
], async (req, res) => {
  try {
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, type, rules } = req.body;

    // Aquí implementarías la lógica para guardar en la base de datos
    const newRuleset = {
      id: Date.now(), // ID temporal
      name,
      description: description || '',
      type,
      status: 'active',
      rules,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    // Log de auditoría
    console.log(`⚙️ Ruleset creado: ${name} por usuario ${req.user.id}`);

    res.status(201).json({
      message: 'Ruleset creado exitosamente',
      ruleset: newRuleset
    });

  } catch (error) {
    console.error('Error al crear ruleset:', error);
    res.status(500).json({ 
      error: 'Error al crear el ruleset',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// PUT /api/rulesets/:id - Actualizar ruleset
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('status').optional().isIn(['active', 'inactive', 'draft']).withMessage('Estado no válido')
], async (req, res) => {
  try {
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Aquí implementarías la lógica para actualizar en la base de datos
    const updatedRuleset = {
      id: parseInt(id),
      ...updates,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    // Log de auditoría
    console.log(`⚙️ Ruleset actualizado: ${id} por usuario ${req.user.id}`);

    res.json({
      message: 'Ruleset actualizado exitosamente',
      ruleset: updatedRuleset
    });

  } catch (error) {
    console.error('Error al actualizar ruleset:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el ruleset',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// DELETE /api/rulesets/:id - Eliminar ruleset
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Aquí implementarías la lógica para eliminar de la base de datos

    // Log de auditoría
    console.log(`🗑️ Ruleset eliminado: ${id} por usuario ${req.user.id}`);

    res.json({
      message: 'Ruleset eliminado exitosamente',
      id: parseInt(id)
    });

  } catch (error) {
    console.error('Error al eliminar ruleset:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el ruleset',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

module.exports = router;
