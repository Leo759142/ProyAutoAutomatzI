// Script de Diagnóstico de Base de Datos
// Copiar y pegar en la consola del navegador (F12)

console.log('🔍 DIAGNÓSTICO DE BASE DE DATOS - INICIO');
console.log('='.repeat(60));

// 1. Verificar LocalStorage
console.log('\n1️⃣ VERIFICANDO LOCALSTORAGE:');
const savedData = localStorage.getItem('workflowDb');
if (savedData) {
    console.log(`✅ Datos encontrados: ${savedData.length} caracteres`);
    console.log(`   Primera parte: ${savedData.substring(0, 50)}...`);
} else {
    console.log('❌ No hay datos en localStorage');
}

// 2. Verificar DatabaseService
console.log('\n2️⃣ VERIFICANDO DATABASESERVICE:');
try {
    const dbService = window.DatabaseService?.getInstance();
    if (dbService) {
        console.log('✅ DatabaseService existe');
        
        // Intentar listar templates
        dbService.listTemplates().then(templates => {
            console.log(`\n3️⃣ TEMPLATES ENCONTRADOS: ${templates.length}`);
            templates.forEach((t, i) => {
                console.log(`   ${i + 1}. ${t.name}`);
                console.log(`      - ID: ${t.id}`);
                console.log(`      - Description: ${t.description}`);
                console.log(`      - Problem Description: ${t.problemDescription || 'NO DEFINIDA'}`);
                console.log(`      - Nodes Data: ${t.nodes_data ? 'Presente (' + t.nodes_data.length + ' chars)' : 'AUSENTE'}`);
                console.log(`      - Connections Data: ${t.connections_data ? 'Presente' : 'AUSENTE'}`);
            });
            
            // 4. Verificar schema
            console.log('\n4️⃣ VERIFICANDO SCHEMA DE TABLA:');
            if (dbService.db) {
                const schemaResult = dbService.db.exec('PRAGMA table_info(workflow_templates)');
                if (schemaResult.length > 0) {
                    console.log('✅ Tabla existe. Columnas:');
                    schemaResult[0].values.forEach(col => {
                        console.log(`   - ${col[1]} (${col[2]})`);
                    });
                } else {
                    console.log('❌ No se pudo obtener info de la tabla');
                }
            }
        }).catch(err => {
            console.error('❌ Error listando templates:', err);
        });
    } else {
        console.log('❌ DatabaseService no existe o no está inicializado');
    }
} catch (error) {
    console.error('❌ Error accediendo a DatabaseService:', error);
}

// 5. Verificar defaultTemplates
console.log('\n5️⃣ VERIFICANDO DEFAULT TEMPLATES:');
try {
    // Intentar importar
    import('./templates/DefaultTemplates.js').then(module => {
        const templates = module.defaultTemplates;
        console.log(`✅ DefaultTemplates cargados: ${templates.length}`);
        templates.forEach((t, i) => {
            console.log(`   ${i + 1}. ${t.name}`);
            console.log(`      - Has problemDescription: ${t.problemDescription ? 'SÍ' : 'NO'}`);
        });
    }).catch(err => {
        console.error('❌ Error cargando DefaultTemplates:', err);
    });
} catch (error) {
    console.error('❌ Error con DefaultTemplates:', error);
}

console.log('\n' + '='.repeat(60));
console.log('🔍 DIAGNÓSTICO COMPLETO - Revisa los resultados arriba');
