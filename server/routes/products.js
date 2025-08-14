const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/products - Listar productos
router.get('/', auth, async (req, res) => {
  try {
    // Por ahora retornamos datos mock, pero aquí implementarías
    // la lógica para obtener productos desde la base de datos
    const mockProducts = [
      {
        id: 1,
        name: 'Producto A',
        price: 100.00,
        cost: 70.00,
        margin: 30.00,
        category: 'Electrónicos',
        status: 'active'
      },
      {
        id: 2,
        name: 'Producto B',
        price: 150.00,
        cost: 90.00,
        margin: 60.00,
        category: 'Ropa',
        status: 'active'
      }
    ];

    res.json({
      message: 'Productos obtenidos exitosamente',
      products: mockProducts,
      total: mockProducts.length
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// POST /api/products - Crear producto
router.post('/', auth, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('El nombre es requerido y no puede exceder 100 caracteres'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('cost').isFloat({ min: 0 }).withMessage('El costo debe ser un número positivo'),
  body('category').trim().isLength({ max: 50 }).withMessage('La categoría no puede exceder 50 caracteres')
], async (req, res) => {
  try {
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, cost, category, description } = req.body;
    const margin = price - cost;

    // Aquí implementarías la lógica para guardar en la base de datos
    const newProduct = {
      id: Date.now(), // ID temporal
      name,
      price: parseFloat(price),
      cost: parseFloat(cost),
      margin: parseFloat(margin.toFixed(2)),
      category,
      description: description || '',
      createdBy: req.user.id,
      createdAt: new Date(),
      status: 'active'
    };

    // Log de auditoría
    console.log(`📦 Producto creado: ${name} por usuario ${req.user.id}`);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProduct
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ 
      error: 'Error al crear el producto',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// PUT /api/products/:id - Actualizar producto
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('price').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('cost').optional().isFloat({ min: 0 }).withMessage('El costo debe ser un número positivo'),
  body('category').optional().trim().isLength({ max: 50 }).withMessage('La categoría no puede exceder 50 caracteres')
], async (req, res) => {
  try {
    // Validar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const updates = req.body;

    // Si se actualizan precio o costo, recalcular margen
    if (updates.price || updates.cost) {
      const currentPrice = updates.price || 100; // Valor por defecto
      const currentCost = updates.cost || 70; // Valor por defecto
      updates.margin = parseFloat((currentPrice - currentCost).toFixed(2));
    }

    // Aquí implementarías la lógica para actualizar en la base de datos
    const updatedProduct = {
      id: parseInt(id),
      ...updates,
      updatedBy: req.user.id,
      updatedAt: new Date()
    };

    // Log de auditoría
    console.log(`📦 Producto actualizado: ${id} por usuario ${req.user.id}`);

    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ 
      error: 'Error al actualizar el producto',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Aquí implementarías la lógica para eliminar de la base de datos
    // Por ahora solo simulamos la eliminación

    // Log de auditoría
    console.log(`🗑️ Producto eliminado: ${id} por usuario ${req.user.id}`);

    res.json({
      message: 'Producto eliminado exitosamente',
      id: parseInt(id)
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ 
      error: 'Error al eliminar el producto',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

module.exports = router;
