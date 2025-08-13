#!/bin/bash

echo "🚀 Iniciando build de AcuBat en Vercel..."

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build del frontend Next.js
echo "🔨 Construyendo frontend..."
npm run build

# Crear directorio para el backend
echo "📁 Preparando backend..."
mkdir -p api

# Copiar archivos del servidor
cp -r server/* api/

# Instalar dependencias del servidor en el directorio api
cd api
npm install --production
cd ..

echo "✅ Build completado exitosamente!"
echo "🎯 Frontend construido en .next/"
echo "🔧 Backend preparado en api/"
