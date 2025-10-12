// 🔄 SCRIPT DE ACTUALIZACIÓN FORZADA DE BASE DE DATOS
// Ejecutar en consola del navegador (F12) para actualizar schema

console.log('🔄 INICIO DE ACTUALIZACIÓN FORZADA');
console.log('='.repeat(70));

(async function() {
    try {
        // 1. ELIMINAR BASE DE DATOS VIEJA
        console.log('\n1️⃣ Eliminando base de datos antigua...');
        localStorage.removeItem('workflowDb');
        console.log('✅ localStorage limpiado');
        
        // 2. RECARGAR LA PÁGINA
        console.log('\n2️⃣ La página se recargará en 2 segundos...');
        console.log('   Esto recreará la base de datos con el schema correcto.');
        console.log('   Los templates por defecto se cargarán automáticamente.');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n🔄 RECARGANDO...');
        location.reload();
        
    } catch (error) {
        console.error('❌ Error durante la actualización:', error);
        console.log('\n📝 INSTRUCCIONES MANUALES:');
        console.log('1. Abre DevTools (F12)');
        console.log('2. Ve a Application → Storage → Local Storage');
        console.log('3. Elimina la entrada "workflowDb"');
        console.log('4. Recarga la página (F5)');
    }
})();

console.log('\n' + '='.repeat(70));
