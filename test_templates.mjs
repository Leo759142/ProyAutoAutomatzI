import { readFileSync } from 'fs';

try {
  const content = readFileSync('./src/templates/DefaultTemplates.ts', 'utf-8');
  
  // Contar los templates (objetos en el array)
  const matches = content.match(/^\s+name:\s+['"][^'"]+['"]/gm);
  console.log('Total templates found:', matches ? matches.length : 0);
  
  if (matches) {
    const names = matches.map(m => m.match(/name:\s+['"]([^'"]+)['"]/)[1]);
    console.log('\nTemplate names:');
    names.forEach((name, i) => console.log(`${i + 1}. ${name}`));
    
    // Buscar duplicados
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      console.log('\n❌ DUPLICADOS ENCONTRADOS:');
      duplicates.forEach(dup => console.log(`  - ${dup}`));
    } else {
      console.log('\n✅ No hay nombres duplicados');
    }
  }
  
  // Verificar estructura del array
  const arrayMatch = content.match(/export const defaultTemplates[^=]+=\s*\[/);
  const arrayClose = content.match(/\]\s*$/m);
  
  console.log('\n Array structure:');
  console.log('  Array opening:', arrayMatch ? '✅' : '❌');
  console.log('  Array closing:', arrayClose ? '✅' : '❌');
  
} catch (error) {
  console.error('Error:', error);
}
