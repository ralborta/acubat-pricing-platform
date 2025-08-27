import { mapColumnsStrict } from "./app/lib/pricing_mapper.js";

const columnas = ["TIPO", "Denominacion Comercial", "__EMPTY_2", "Unidades por Pallet", "Kg por Pallet"];
const hojas = ["ListaVarta", "Equivalencias"];
const muestra = [
  { "TIPO": "Ca Ag Blindada", "Denominacion Comercial": "UB 670 Ag", "__EMPTY_2": 188992, "Unidades por Pallet": 24 },
  { "TIPO": "J.I.S. Baterías", "Denominacion Comercial": "VA40DD/E", "__EMPTY_2": 156535, "Unidades por Pallet": 20 }
];

(async () => {
  try {
    console.log('🧠 Iniciando test del módulo pricing_mapper...');
    console.log('📋 Columnas:', columnas);
    console.log('📋 Muestra:', muestra);
    
    const { result, attempts } = await mapColumnsStrict({ 
      columnas, 
      hojas, 
      muestra, 
      maxRetries: 1 
    });
    
    console.log('\n✅ RESULTADO EXITOSO:');
    console.log('🔄 Intentos:', attempts);
    console.log('📋 Resultado:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ ERROR EN TEST:', error);
    console.error('📋 Stack:', error.stack);
  }
})();

