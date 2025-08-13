const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/acubat_pricing', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    
    // Crear índices para optimizar consultas
    await createIndexes();
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // Índices para productos
    await mongoose.model('Product').createIndexes();
    
    // Índices para simulaciones
    await mongoose.model('Simulation').createIndexes();
    
    // Índices para rulesets
    await mongoose.model('Ruleset').createIndexes();
    
    // Índices para usuarios
    await mongoose.model('User').createIndexes();
    
    console.log('✅ Índices de base de datos creados correctamente');
  } catch (error) {
    console.log('⚠️ Algunos índices no pudieron ser creados:', error.message);
  }
};

module.exports = connectDB;
