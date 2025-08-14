const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/simulations - Listar simulaciones
router.get('/', auth, async (req, res) => {
  try {
    // Por ahora retornamos datos mock
    const mockSimulations = [
      {
        id: 1,
        name: 'Simulación Q1 2024',
        description: 'Análisis de precios para el primer trimestre',
        status: 'completed',
        startDate: '2024-01-01',
        endDate: '2024-03-31',
        totalProducts: 150,
        averageMargin: 28.5,
        createdBy: req.user.id
      },
      {
        id: 2,
        name: 'Simulación Q2 2024',
        description: 'Análisis de precios para el segundo trimestre',
        status: 'in_progress',
        startDate: '2024-04-01',
        endDate: '2024-06-30',
        totalProducts: 120,
        averageMargin: 32.1,
        createdBy: req.user.id
      }
    ];

    res.json({
      message: 'Simulaciones obtenidas exitosamente',
      simulations: mockSimulations,
      total: mockSimulations.length
    });

  } catch (error) {
    console.error('Error al obtener simulaciones:', error);
    res.status(500).json({ 
      error: 'Error al obtener simulaciones',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// POST /api/simulations - Crear simulación
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('El nombre es requerido y no puede exceder 100 caracteres'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('startDate').isISO8601().withMessage('La fecha de inicio debe ser válida'),
  body('endDate').isISO8601().withMessage('La fecha de fin debe ser válida')
], async (req, res) => {
  try {
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, startDate, endDate } = req.body;

    // Aquí implementarías la lógica para guardar en la base de datos
    const newSimulation = {
      id: Date.now(), // ID temporal
      name,
      description: description || '',
      status: 'pending',
      startDate,
      endDate,
      totalProducts: 0,
      averageMargin: 0,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    // Log de auditoría
    console.log(`📊 Simulación creada: ${name} por usuario ${req.user.id}`);

    res.status(201).json({
      message: 'Simulación creada exitosamente',
      simulation: newSimulation
    });

  } catch (error) {
    console.error('Error al crear simulación:', error);
    res.status(500).json({ 
      error: 'Error al crear la simulación',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// PUT /api/simulations/:id - Actualizar simulación
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Estado no válido')
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
    const updatedSimulation = {
      id: parseInt(id),
      ...updates,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    // Log de auditoría
    console.log(`📊 Simulación actualizada: ${id} por usuario ${req.user.id}`);

    res.json({
      message: 'Simulación actualizada exitosamente',
      simulation: updatedSimulation
    });

  } catch (error) {
    console.error('Error al actualizar simulación:', error);
    res.status(500).json({ 
      error: 'Error al actualizar la simulación',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// DELETE /api/simulations/:id - Eliminar simulación
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Aquí implementarías la lógica para eliminar de la base de datos

    // Log de auditoría
    console.log(`🗑️ Simulación eliminada: ${id} por usuario ${req.user.id}`);

    res.json({
      message: 'Simulación eliminada exitosamente',
      id: parseInt(id)
    });

  } catch (error) {
    console.error('Error al eliminar simulación:', error);
    res.status(500).json({ 
      error: 'Error al eliminar la simulación',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

module.exports = router;
